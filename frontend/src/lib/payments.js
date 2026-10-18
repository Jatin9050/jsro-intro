/*
 * Razorpay Standard Checkout, browser side.
 *
 * Registering for an event with a fee and paying are one step: send the
 * registration form to our server (it creates the registration and an order
 * for the fee it looks up), open Razorpay's checkout for that order, and when
 * it succeeds hand the three values Razorpay returns to our server to verify.
 * The registration code comes back only from that verification. Nothing here
 * knows the key secret, and nothing here decides an amount or a payment status.
 */

export class PaymentError extends Error {
  constructor(message, { alreadyPaid = false } = {}) {
    super(message);
    this.name = 'PaymentError';
    this.alreadyPaid = alreadyPaid;
  }
}

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
const GENERIC = 'Something went wrong starting the payment. Try again, or contact JSRO.';

let loading = null;

// Loaded when someone actually goes to pay, so no other page ever contacts Razorpay.
export function loadCheckout() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = CHECKOUT_SRC;
      script.async = true;
      script.onload = () => (window.Razorpay
        ? resolve(window.Razorpay)
        : reject(new PaymentError('The payment window did not load. Try again.')));
      script.onerror = () => {
        loading = null;
        script.remove();
        reject(new PaymentError('The payment window could not be loaded. Check your connection and try again.'));
      };
      document.head.appendChild(script);
    });
  }
  return loading;
}

async function postJson(path, body) {
  let response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new PaymentError('Could not reach JSRO. Check your connection and try again.');
  }

  let data = null;
  try { data = await response.json(); } catch { /* not JSON */ }

  if (!response.ok) {
    // 400, 404 and 409 carry a message written for the visitor; anything else is a fault.
    const message = [400, 404, 409].includes(response.status) && typeof data?.error === 'string'
      ? data.error
      : GENERIC;
    throw new PaymentError(message, { alreadyPaid: data?.already_paid === true });
  }
  return data;
}

/*
 * Registers and pays. `details` is the registration form:
 * { event_slug, name, email, phone, school }. Resolves with
 *   { status: 'paid', registrationCode, paymentId }  verified by the server
 *   { status: 'cancelled' }    the visitor closed the window; nothing was taken
 *   { status: 'unconfirmed', paymentId }  Razorpay reported success but we could not verify it
 * and throws PaymentError if the registration or the order could not be made.
 * `onFailed(message)` is called when an attempt fails inside the window (the
 * visitor can retry there, so the promise stays open).
 */
export async function payForRegistration({ details, description, onFailed }) {
  const order = await postJson('/api/create-order', details);
  if (typeof order?.order_id !== 'string' || !Number.isInteger(order.amount)) throw new PaymentError(GENERIC);

  const Razorpay = await loadCheckout();

  return new Promise((resolve) => {
    const checkout = new Razorpay({
      key: process.env.REACT_APP_RAZORPAY_KEY_ID || order.key_id,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: 'JSRO',
      description,
      image: `${window.location.origin}/logojsro.jpeg`,
      prefill: {
        name: details.name,
        email: details.email,
        contact: String(details.phone || '').replace(/[^0-9+]/g, ''),
      },
      theme: { color: '#ff4f00' },
      handler: async (response) => {
        try {
          const verified = await postJson('/api/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          resolve({ status: 'paid', registrationCode: verified?.registration_code || null, paymentId: response.razorpay_payment_id });
        } catch {
          resolve({ status: 'unconfirmed', paymentId: response.razorpay_payment_id });
        }
      },
      modal: { ondismiss: () => resolve({ status: 'cancelled' }) },
    });

    checkout.on('payment.failed', (event) => {
      if (onFailed) onFailed(event?.error?.description || 'The payment did not go through.');
    });
    checkout.open();
  });
}

/* "Already paid? Get your code": the email plus the payment id from Razorpay's receipt. */
export async function findRegistrationCode({ email, paymentId }) {
  const found = await postJson('/api/find-registration', { email, razorpay_payment_id: paymentId });
  if (typeof found?.registration_code !== 'string') throw new PaymentError(GENERIC);
  return found.registration_code;
}
