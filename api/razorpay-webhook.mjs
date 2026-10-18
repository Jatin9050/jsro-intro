// Vercel function: POST /api/razorpay-webhook. The logic is in backend/src/payments.
import { webhookHttp } from '../backend/src/payments/http.js';

// The signature is over the exact bytes Razorpay sent, so Vercel must not parse the body first.
export const config = { api: { bodyParser: false } };

export default webhookHttp;
