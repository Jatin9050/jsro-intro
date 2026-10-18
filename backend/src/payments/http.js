import Razorpay from 'razorpay';

import { ConfigError, readConfig, readWebhookSecret } from './config.js';
import { createDb } from './db.js';
import { createOrder, verifyPayment } from './handlers.js';
import { handleWebhook } from './webhook.js';

/*
 * HTTP glue shared by the local Node server and the Vercel functions: method
 * and content-type checks, body reading, the real dependencies, and a handler
 * that never leaks an internal error to the visitor.
 */

const MAX_BODY_BYTES = 8 * 1024;

let cached;
function dependencies() {
  if (!cached) {
    const config = readConfig();
    cached = {
      config,
      razorpay: new Razorpay({ key_id: config.keyId, key_secret: config.keySecret }),
      db: createDb(config),
    };
  }
  return cached;
}

function send(response, status, body, headers = {}) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...headers,
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  // Vercel has already parsed the body for us.
  if (request.body !== undefined && request.body !== null) {
    if (typeof request.body === 'object') return request.body;
    return JSON.parse(String(request.body));
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('too large'), { status: 413 });
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

/* Wraps a handler (body, deps) -> { status, body } as (request, response). */
export function route(handler, { deps = dependencies } = {}) {
  return async (request, response) => {
    if (request.method !== 'POST') return send(response, 405, { error: 'Use POST.' }, { allow: 'POST' });

    // Requiring JSON means a page on another site cannot post to this endpoint
    // with a plain form: the browser would have to ask permission first, and no
    // CORS headers are ever sent.
    if (!/^application\/json\b/i.test(request.headers['content-type'] || '')) {
      return send(response, 415, { error: 'Send JSON.' });
    }

    let body;
    try {
      body = await readJson(request);
    } catch (error) {
      return send(response, error.status === 413 ? 413 : 400, { error: 'The request body is not valid JSON.' });
    }

    try {
      const result = await handler(body, deps());
      return send(response, result.status, result.body);
    } catch (error) {
      if (error instanceof ConfigError) {
        console.error('payments:', error.message);
        return send(response, 500, { error: 'Online payment is not set up yet. Contact JSRO.' });
      }
      console.error('payments: unexpected failure', error?.code || error?.name);
      return send(response, 500, { error: 'Something went wrong. Try again in a moment.' });
    }
  };
}

/*
 * The webhook route. Unlike the others it needs the exact bytes Razorpay sent,
 * so it reads the raw body itself (the Vercel function turns body parsing off).
 * If a platform has already parsed the body, the bytes are gone and the
 * signature cannot be checked: that fails closed, with a log line saying why.
 */
const WEBHOOK_MAX_BYTES = 256 * 1024;

export function webhookRoute({ deps = () => ({ webhookSecret: readWebhookSecret(), db: dependencies().db }) } = {}) {
  return async (request, response) => {
    if (request.method !== 'POST') return send(response, 405, { error: 'Use POST.' }, { allow: 'POST' });

    let raw;
    try {
      if (request.body !== undefined && request.body !== null && !Buffer.isBuffer(request.body)) {
        console.error('razorpay webhook: body was already parsed, so its signature cannot be checked');
        return send(response, 500, { error: 'Webhook is not set up correctly.' });
      }
      if (Buffer.isBuffer(request.body)) {
        raw = request.body;
      } else {
        const chunks = [];
        let size = 0;
        for await (const chunk of request) {
          size += chunk.length;
          if (size > WEBHOOK_MAX_BYTES) return send(response, 413, { error: 'Too large.' });
          chunks.push(chunk);
        }
        raw = Buffer.concat(chunks);
      }
    } catch {
      return send(response, 400, { error: 'Could not read the request.' });
    }

    try {
      const signature = request.headers['x-razorpay-signature'];
      const result = await handleWebhook(raw, Array.isArray(signature) ? signature[0] : signature, deps());
      return send(response, result.status, result.body);
    } catch (error) {
      if (error instanceof ConfigError) {
        console.error('payments:', error.message);
        return send(response, 500, { error: 'Webhook is not set up yet.' });
      }
      // 500 makes Razorpay retry, which is what we want when recording failed.
      console.error('razorpay webhook: unexpected failure', error?.code || error?.message);
      return send(response, 500, { error: 'Something went wrong.' });
    }
  };
}

export const webhookHttp = webhookRoute();

export const createOrderRoute = route(createOrder);
export const verifyPaymentRoute = route(verifyPayment);
