// Vercel function: POST /api/verify-payment. The logic is in backend/src/payments.
import { verifyPaymentRoute } from '../backend/src/payments/http.js';

export default verifyPaymentRoute;
