import { signatureMatches } from './signature.js';
import { parseRegistration, parseVerification, ORDER_SHAPE } from './validate.js';

/*
 * The two payment endpoints, as plain functions: parsed JSON body in, a
 * { status, body } answer out. The Razorpay client and the database are passed
 * in, so the same code serves the Node server, the Vercel functions and the
 * tests.
 *
 * What the browser is trusted with: a registration code + email (the same pair
 * that authorises a project submission) and the three values Razorpay's
 * checkout hands back. It is never trusted with an amount, a payment status or
 * a row id.
 */

const MIN_PAISE = 100;

const reply = (status, body) => ({ status, body });
const fail = (status, error, extra = {}) => reply(status, { error, ...extra });

/* ------------------------------------------------------------ create order */
export async function createOrder(body, { config, razorpay, db }) {
  const registration = parseRegistration(body);
  if (!registration) return fail(400, 'Enter your registration code and the email you registered with.');

  const found = await db.findRegistration(registration.code, registration.email);
  // One answer for "no such code" and "wrong email", so this cannot be used to
  // find out which codes exist.
  if (!found) return fail(400, 'That registration code and email do not match.');

  const amount = await db.getEventFee(found.event_slug);
  if (!Number.isInteger(amount) || amount < MIN_PAISE) {
    return fail(409, 'Online payment is not open for this event yet. JSRO will contact you with the fee and how to pay it.');
  }

  const payments = await db.listPayments(found.id);
  if (payments.some((p) => p.status === 'paid')) {
    return fail(409, 'This registration is already paid.', { already_paid: true });
  }

  // Someone who closed the window and came back gets the same order, not a
  // pile of abandoned ones.
  const open = payments.find((p) => p.status === 'created' && p.amount_paise === amount);
  if (open) {
    return reply(200, { order_id: open.razorpay_order_id, amount: open.amount_paise, currency: 'INR', key_id: config.keyId });
  }

  let order;
  try {
    order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: registration.code,
      notes: { registration_code: registration.code, event: found.event_slug },
    });
  } catch (error) {
    // Log what went wrong for us; tell the visitor only what they can act on.
    console.error('razorpay: order creation failed', error?.statusCode, error?.error?.code);
    if (error?.statusCode === 401) return fail(401, 'The payment service rejected this server. JSRO has been unable to start the payment.');
    return fail(500, 'Could not start the payment. Try again in a moment.');
  }

  if (!order || !ORDER_SHAPE.test(order.id) || order.amount !== amount || order.currency !== 'INR') {
    console.error('razorpay: unexpected order response');
    return fail(500, 'Could not start the payment. Try again in a moment.');
  }

  await db.insertPayment({ registration_id: found.id, razorpay_order_id: order.id, amount_paise: amount });
  return reply(200, { order_id: order.id, amount, currency: 'INR', key_id: config.keyId });
}

/* ---------------------------------------------------------- verify payment */
export async function verifyPayment(body, { config, db }) {
  const details = parseVerification(body);
  if (!details) return fail(400, 'Payment details are missing or malformed.');

  if (!signatureMatches({ ...details, secret: config.keySecret })) {
    // Never marked paid. This is also what a forged request looks like.
    return fail(400, 'The payment could not be verified.');
  }

  const payment = await db.findPaymentByOrder(details.orderId);
  // A valid signature on an order we never created is not ours to record.
  if (!payment) return fail(404, 'No payment is waiting for that order.');

  if (payment.status === 'paid') return reply(200, { verified: true, already_recorded: true });

  const marked = await db.markPaid({ orderId: details.orderId, paymentId: details.paymentId });
  if (!marked) {
    // Lost a race with another verification of the same order; it is paid.
    const again = await db.findPaymentByOrder(details.orderId);
    if (again?.status !== 'paid') return fail(500, 'The payment was received but could not be recorded. Contact JSRO with your registration code.');
    return reply(200, { verified: true, already_recorded: true });
  }
  return reply(200, { verified: true });
}
