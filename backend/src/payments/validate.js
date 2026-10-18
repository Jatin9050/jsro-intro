// Shapes of the values this API accepts. Anything else is refused before it
// reaches Razorpay or the database.

export const CODE_SHAPE = /^[A-Z0-9]{2,6}-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/;
export const ORDER_SHAPE = /^order_[A-Za-z0-9]{8,40}$/;
export const PAYMENT_SHAPE = /^pay_[A-Za-z0-9]{8,40}$/;
export const SIGNATURE_SHAPE = /^[a-f0-9]{64}$/i;
const EMAIL_SHAPE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/* Returns { code, email } normalised the way the database stores them, or null. */
export function parseRegistration(body) {
  if (!isObject(body)) return null;
  const code = typeof body.registration_code === 'string' ? body.registration_code.trim().toUpperCase() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!CODE_SHAPE.test(code) || email.length > 254 || !EMAIL_SHAPE.test(email)) return null;
  return { code, email };
}

/* Returns { orderId, paymentId, signature } or null. */
export function parseVerification(body) {
  if (!isObject(body)) return null;
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body;
  if (typeof orderId !== 'string' || !ORDER_SHAPE.test(orderId)) return null;
  if (typeof paymentId !== 'string' || !PAYMENT_SHAPE.test(paymentId)) return null;
  if (typeof signature !== 'string' || !SIGNATURE_SHAPE.test(signature)) return null;
  return { orderId, paymentId, signature };
}
