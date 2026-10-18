/*
 * Razorpay Standard Checkout, browser side.
 *
 * What happens: ask our server for an order (it decides the amount), open
 * Razorpay's checkout for that order, and when it succeeds hand the three
 * values Razorpay returns to our server to verify. Nothing here knows the key
 * secret, and nothing here says how much is owed or whether something was
 * paid; the server does.
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
    // 400 and 409 carry a message written for the visitor; anything else is a fault.
    const message = (response.status === 400 || response.status === 409) && typeof data?.error === 'string'
      ? data.error
      : GENERIC;
    throw new PaymentError(message, { alreadyPaid: data?.already_paid === true });
  }
  return data;
}

/*
 * Runs the whole payment. Resolves with
 *   { status: 'paid' }         verified by the server
 *   { status: 'cancelled' }    the visitor closed the window; nothing was taken
 *   { status: 'unconfirmed' }  Razorpay reported success but we could not verify it
 * and throws PaymentError if the order could not be created at all.
 * `onFailed(message)` is called when an attempt fails inside the window (the
 * visitor can retry there, so the promise stays open).
 */
export async function payForRegistration({ code, email, description, onFailed }) {
  const order = await postJson('/api/create-order', { registration_code: code, email });
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
      prefill: { email },
      theme: { color: '#ff4f00' },
      handler: async (response) => {
        try {
          await postJson('/api/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          resolve({ status: 'paid' });
        } catch {
          resolve({ status: 'unconfirmed' });
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
