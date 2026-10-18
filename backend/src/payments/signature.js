import { createHmac, timingSafeEqual } from 'node:crypto';

/*
 * Razorpay signs a successful payment as
 *   HMAC-SHA256(order_id + "|" + payment_id, key_secret)
 * and the browser hands that signature back to us. Anyone can send us any
 * three strings; only Razorpay (and we) can produce a matching signature.
 */
export const sign = (orderId, paymentId, secret) =>
  createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');

export function signatureMatches({ orderId, paymentId, signature, secret }) {
  if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = Buffer.from(sign(orderId, paymentId, secret), 'hex');
  const given = Buffer.from(signature, 'hex');
  // Constant-time, so response timing cannot be used to guess a signature.
  return given.length === expected.length && timingSafeEqual(expected, given);
}
