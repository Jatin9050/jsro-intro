import { signatureMatches } from './signature.js';
import { parseLookup, parseRegistration, parseVerification, ORDER_SHAPE } from './validate.js';

/*
 * The payment endpoints, as plain functions: parsed JSON body in, a
 * { status, body } answer out. The Razorpay client and the database are passed
 * in, so the same code serves the Node server, the Vercel functions and the
 * tests.
 *
 * Registering for an event with a fee and paying are one step. The browser
 * sends the registration form; the registration code (the credential for
 * submitting a project) comes back only after the payment is verified. The
 * browser is never trusted with an amount, a payment status or a row id.
 */

const MIN_PAISE = 100;

const reply = (status, body) => ({ status, body });
const fail = (status, error, extra = {}) => reply(status, { error, ...extra });

/* ------------------------------------------------- register + create order */
export async function createOrder(body, { config, razorpay, db }) {
  const details = parseRegistration(body);
  if (!details) return fail(400, 'Fill in every field of the registration form.');

  let found;
  try {
    // Creates the registration, or finds this email's unpaid one. Returns the
    // id and the fee, never the code.
    found = await db.startPaidRegistration(details);
  } catch (error) {
    // P0001 messages are written for the visitor (closed, invalid phone, already paid...).
    if (error?.code === 'P0001' && typeof error.message === 'string') {
      return fail(400, error.message, /already registered and paid/.test(error.message) ? { already_paid: true } : {});
    }
    throw error;
  }

  const amount = found.fee;
  if (!Number.isInteger(amount) || amount < MIN_PAISE) {
    return fail(409, 'Online payment is not open for this event yet.');
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
      receipt: found.id, // a uuid, 36 characters (Razorpay allows 40)
      notes: { registration_id: found.id, event: found.event_slug },
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

  let alreadyRecorded = payment.status === 'paid';
  if (!alreadyRecorded) {
    const marked = await db.markPaid({ orderId: details.orderId, paymentId: details.paymentId });
    if (!marked) {
      // Lost a race with another verification (or the webhook); it is paid.
      const again = await db.findPaymentByOrder(details.orderId);
      if (again?.status !== 'paid') return fail(500, 'The payment was received but could not be recorded. Contact JSRO with your payment ID.');
      alreadyRecorded = true;
    }
  }

  // Only now, with a verified payment, is the registration code handed out.
  const code = await db.getCodeForOrder(details.orderId);
  return reply(200, { verified: true, registration_code: code, ...(alreadyRecorded ? { already_recorded: true } : {}) });
}

/* -------------------------------------------- already paid? get your code */
export async function findRegistration(body, { db }) {
  const lookup = parseLookup(body);
  if (!lookup) return fail(400, 'Enter the email you registered with and the payment ID from your Razorpay receipt (it starts with pay_).');

  const found = await db.findPaidByPayment(lookup.paymentId);
  // One answer for every miss, so this cannot be used to probe payments or emails.
  if (!found || found.email !== lookup.email || !found.registration_code) {
    return fail(404, 'No paid registration matches that email and payment ID.');
  }
  return reply(200, { registration_code: found.registration_code, event_slug: found.event_slug });
}
