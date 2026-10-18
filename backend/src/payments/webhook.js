import { createHmac, timingSafeEqual } from 'node:crypto';

import { ORDER_SHAPE, PAYMENT_SHAPE } from './validate.js';

/*
 * Razorpay's webhook: the server-to-server record of a payment.
 *
 * The browser report (verify-payment) is lost if the buyer closes the tab right
 * after paying. Razorpay then still tells us, here, so the payment is recorded
 * either way. Both paths end in the same guarded database update, so whichever
 * arrives second changes nothing.
 *
 * Razorpay signs the RAW request body: HMAC-SHA256(body, webhook secret),
 * hex, in the X-Razorpay-Signature header. The webhook secret is a different
 * value from the API key secret; you choose it when you create the webhook.
 */

// Events that mean "this payment succeeded". Everything else is acknowledged and ignored.
const PAID_EVENTS = new Set(['payment.captured', 'order.paid']);

const reply = (status, body) => ({ status, body });

export function webhookSignatureMatches(rawBody, signature, secret) {
  if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  const given = Buffer.from(signature, 'hex');
  return given.length === expected.length && timingSafeEqual(expected, given);
}

export async function handleWebhook(rawBody, signature, { webhookSecret, db }) {
  // Nothing in the body is read until the signature over it has checked out.
  if (!webhookSignatureMatches(rawBody, signature, webhookSecret)) {
    return reply(400, { error: 'Invalid signature.' });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return reply(400, { error: 'Invalid body.' });
  }

  if (!PAID_EVENTS.has(event?.event)) return reply(200, { ignored: 'event' });

  const payment = event?.payload?.payment?.entity;
  const orderId = payment?.order_id;
  const paymentId = payment?.id;
  if (typeof orderId !== 'string' || !ORDER_SHAPE.test(orderId) || typeof paymentId !== 'string' || !PAYMENT_SHAPE.test(paymentId)) {
    // Not an order-based payment (the Razorpay account may be used for other things too).
    return reply(200, { ignored: 'not an order payment' });
  }

  const row = await db.findPaymentByOrder(orderId);
  // An order we never created is not ours to record. Acknowledge, so Razorpay stops retrying.
  if (!row) return reply(200, { ignored: 'unknown order' });
  if (row.status === 'paid') return reply(200, { already_recorded: true });

  // Money must match what we asked for. A mismatch is never recorded as paid.
  if (payment.status !== 'captured' || payment.amount !== row.amount_paise || payment.currency !== 'INR') {
    console.error('razorpay webhook: payment does not match its order', orderId, payment.status, payment.amount, payment.currency);
    return reply(200, { ignored: 'mismatch' });
  }

  // If this throws, the caller answers 500 and Razorpay retries later.
  const marked = await db.markPaid({ orderId, paymentId });
  if (!marked) {
    const again = await db.findPaymentByOrder(orderId);
    if (again?.status !== 'paid') throw new Error('webhook: payment could not be recorded');
  }
  return reply(200, marked ? { recorded: true } : { already_recorded: true });
}
