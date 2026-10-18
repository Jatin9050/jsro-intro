// Vercel function: POST /api/create-order. The logic is in backend/src/payments.
import { createOrderRoute } from '../backend/src/payments/http.js';

export default createOrderRoute;
