/*
 * JSRO server.
 *
 * It exists for the work the browser must not be trusted with:
 *
 *   1. Creating a Razorpay order (the key secret is server-only).
 *   2. Verifying the payment signature Razorpay returns.
 *   3. Writing `payment` on a row, using the Supabase service role.
 *
 * The logic lives in ./payments and is the same code the Vercel functions in
 * /api run in production. This file is the local way to run it:
 *
 *   npm run server          (reads backend/.env)
 *
 * and `npm start` in the frontend proxies /api to it.
 */

import { createServer } from 'node:http';

import { createOrderRoute, verifyPaymentRoute, webhookHttp } from './payments/http.js';

const port = Number(process.env.PORT) || 8080;

const routes = {
  '/api/create-order': createOrderRoute,
  '/api/verify-payment': verifyPaymentRoute,
  '/api/razorpay-webhook': webhookHttp,
};

const server = createServer((request, response) => {
  const { pathname } = new URL(request.url, 'http://localhost');

  if (pathname === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ ok: true, service: 'jsro-backend' }));
    return;
  }

  const handle = routes[pathname];
  if (handle) {
    handle(request, response);
    return;
  }

  response.writeHead(404, { 'content-type': 'application/json' });
  response.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, () => {
  console.log(`jsro-backend listening on :${port}`);
});
