/*
 * JSRO server — scaffold.
 *
 * It exists for the work the browser must not be trusted with:
 *
 *   1. Creating a Razorpay order (the key secret is server-only).
 *   2. Verifying the payment signature Razorpay returns.
 *   3. Writing `payment` / `paid` on a row, using the Supabase service role.
 *
 * Nothing is implemented yet — the payment flow has not been specified. This
 * file fixes the shape so the work lands in one obvious place.
 */

import { createServer } from 'node:http';

const port = Number(process.env.PORT) || 8080;

const server = createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ ok: true, service: 'jsro-backend' }));
    return;
  }

  response.writeHead(501, { 'content-type': 'application/json' });
  response.end(
    JSON.stringify({
      error: 'Not implemented',
      detail: 'Payment routes are not built yet. See jsro-backend/README.md.',
    })
  );
});

server.listen(port, () => {
  console.log(`jsro-backend listening on :${port}`);
});
