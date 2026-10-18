// Shapes of the values this API accepts. Anything else is refused before it
// reaches Razorpay or the database.

export const CODE_SHAPE = /^[A-Z0-9]{2,6}-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/;
export const ORDER_SHAPE = /^order_[A-Za-z0-9]{8,40}$/;
export const PAYMENT_SHAPE = /^pay_[A-Za-z0-9]{8,40}$/;
export const SIGNATURE_SHAPE = /^[a-f0-9]{64}$/i;
const EMAIL_SHAPE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const SLUG_SHAPE = /^[a-z0-9-]{2,60}$/;
const text = (value, max) => (typeof value === 'string' && value.trim().length > 0 && value.length <= max ? value : null);

/*
 * The registration form. Only shape is checked here; the database function
 * applies the real rules and its messages are shown to the visitor.
 */
export function parseRegistration(body) {
  if (!isObject(body)) return null;
  const eventSlug = typeof body.event_slug === 'string' && SLUG_SHAPE.test(body.event_slug) ? body.event_slug : null;
  const name = text(body.name, 200);
  const email = text(body.email, 254);
  const phone = text(body.phone, 40);
  const school = text(body.school, 200);
  if (!eventSlug || !name || !email || !phone || !school) return null;
  return { eventSlug, name, email, phone, school };
}

/* "Already paid? Get your code": the email plus the payment id from Razorpay's receipt. */
export function parseLookup(body) {
  if (!isObject(body)) return null;
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const paymentId = typeof body.razorpay_payment_id === 'string' ? body.razorpay_payment_id.trim() : '';
  if (email.length > 254 || !EMAIL_SHAPE.test(email) || !PAYMENT_SHAPE.test(paymentId)) return null;
  return { email, paymentId };
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
