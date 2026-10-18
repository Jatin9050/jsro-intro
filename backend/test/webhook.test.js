import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createServer } from 'node:http';
import { test } from 'node:test';

import { readWebhookSecret, ConfigError } from '../src/payments/config.js';
import { webhookRoute } from '../src/payments/http.js';
import { handleWebhook, webhookSignatureMatches } from '../src/payments/webhook.js';

const SECRET = 'webhook-test-secret';
const ORDER = 'order_TestOrder0001';
const PAYMENT = 'pay_TestPayment0001';
const sign = (raw, secret = SECRET) => createHmac('sha256', secret).update(raw).digest('hex');

const captured = (over = {}) => ({
  event: 'payment.captured',
  payload: { payment: { entity: { id: PAYMENT, order_id: ORDER, amount: 10000, currency: 'INR', status: 'captured', ...over } } },
});
const body = (event) => Buffer.from(JSON.stringify(event));

function fakeDb(rows = [{ razorpay_order_id: ORDER, status: 'created', amount_paise: 10000 }]) {
  const calls = { marked: [] };
  const db = {
    async findPaymentByOrder(id) { return rows.find((r) => r.razorpay_order_id === id) ?? null; },
    async markPaid(args) {
      calls.marked.push(args);
      const row = rows.find((r) => r.razorpay_order_id === args.orderId && r.status === 'created');
      if (!row) return false;
      row.status = 'paid';
      return true;
    },
  };
  return { db, calls, rows };
}
const run = (raw, signature, db) => handleWebhook(raw, signature, { webhookSecret: SECRET, db });

test('webhook signature: matches an independent HMAC of the raw body, rejects everything else', () => {
  const raw = body(captured());
  assert.equal(webhookSignatureMatches(raw, sign(raw), SECRET), true);
  assert.equal(webhookSignatureMatches(raw, sign(raw, 'other-secret'), SECRET), false);
  assert.equal(webhookSignatureMatches(Buffer.from(raw + ' '), sign(raw), SECRET), false, 'one extra byte breaks it');
  for (const signature of [undefined, null, '', 'abc', 'z'.repeat(64), sign(raw).slice(1), 42]) {
    assert.equal(webhookSignatureMatches(raw, signature, SECRET), false, String(signature));
  }
});

test('webhook: a genuine captured payment for our order is recorded', async () => {
  const { db, calls } = fakeDb();
  const raw = body(captured());
  const result = await run(raw, sign(raw), db);
  assert.equal(result.status, 200);
  assert.equal(result.body.recorded, true);
  assert.deepEqual(calls.marked, [{ orderId: ORDER, paymentId: PAYMENT }]);
});

test('webhook: order.paid is handled like payment.captured', async () => {
  const { db, calls } = fakeDb();
  const raw = body({ ...captured(), event: 'order.paid' });
  assert.equal((await run(raw, sign(raw), db)).status, 200);
  assert.equal(calls.marked.length, 1);
});

test('webhook: a missing or wrong signature is a 400 and nothing is recorded', async () => {
  for (const signature of [undefined, 'a'.repeat(64), sign(body(captured()), 'attacker')]) {
    const { db, calls } = fakeDb();
    const result = await run(body(captured()), signature, db);
    assert.equal(result.status, 400);
    assert.deepEqual(calls.marked, []);
  }
});

test('webhook: a valid signature over a tampered body does not count', async () => {
  const { db, calls } = fakeDb();
  const original = body(captured());
  const tampered = body(captured({ amount: 100 }));
  assert.equal((await run(tampered, sign(original), db)).status, 400);
  assert.deepEqual(calls.marked, []);
});

test('webhook: nothing is trusted before the signature (bad JSON with a bad signature is just 400)', async () => {
  const { db, calls } = fakeDb();
  assert.equal((await run(Buffer.from('{not json'), 'a'.repeat(64), db)).status, 400);
  assert.deepEqual(calls.marked, []);
  const junk = Buffer.from('{not json');
  assert.equal((await run(junk, sign(junk), db)).status, 400, 'signed but unparseable');
});

test('webhook: other events are acknowledged and ignored', async () => {
  for (const event of ['payment.failed', 'payment.authorized', 'refund.processed', 'order.something', undefined]) {
    const { db, calls } = fakeDb();
    const raw = body({ ...captured(), event });
    const result = await run(raw, sign(raw), db);
    assert.equal(result.status, 200);
    assert.deepEqual(calls.marked, []);
  }
});

test('webhook: an order we never created is acknowledged, never recorded', async () => {
  const { db, calls } = fakeDb([]);
  const raw = body(captured());
  const result = await run(raw, sign(raw), db);
  assert.equal(result.status, 200);
  assert.deepEqual(calls.marked, []);
});

test('webhook: a payment that does not match the order (amount, currency, status) is never recorded', async () => {
  for (const over of [{ amount: 100 }, { amount: 20000 }, { currency: 'USD' }, { status: 'authorized' }, { status: 'failed' }]) {
    const { db, calls } = fakeDb();
    const raw = body(captured(over));
    const result = await run(raw, sign(raw), db);
    assert.equal(result.status, 200, JSON.stringify(over));
    assert.deepEqual(calls.marked, [], JSON.stringify(over));
  }
});

test('webhook: payloads that are not order payments are ignored, and ids are shape-checked', async () => {
  for (const entity of [{ order_id: null }, { order_id: undefined }, { order_id: "order_x'; drop table payments;--" }, { id: 'not-a-payment-id' }]) {
    const { db, calls } = fakeDb();
    const raw = body(captured(entity));
    assert.equal((await run(raw, sign(raw), db)).status, 200);
    assert.deepEqual(calls.marked, []);
  }
  const { db } = fakeDb();
  const raw = body({ event: 'payment.captured', payload: {} });
  assert.equal((await run(raw, sign(raw), db)).status, 200);
});

test('webhook: repeats are harmless, and so is arriving after the browser already reported it', async () => {
  const { db, calls } = fakeDb();
  const raw = body(captured());
  assert.equal((await run(raw, sign(raw), db)).body.recorded, true);
  const again = await run(raw, sign(raw), db);
  assert.equal(again.status, 200);
  assert.equal(again.body.already_recorded, true);
  assert.equal(calls.marked.length, 1);
});

test('webhook: losing a race with the browser report still ends paid', async () => {
  const { db, rows } = fakeDb();
  db.markPaid = async () => { rows[0].status = 'paid'; return false; };
  const raw = body(captured());
  assert.equal((await run(raw, sign(raw), db)).status, 200);
});

test('webhook: if recording fails the error propagates (so the route answers 500 and Razorpay retries)', async () => {
  const { db } = fakeDb();
  db.markPaid = async () => { throw new Error('database down'); };
  const raw = body(captured());
  await assert.rejects(run(raw, sign(raw), db), /database down/);
});

/* ---- the HTTP route ---- */
async function withRoute(deps, run) {
  const server = createServer(webhookRoute({ deps: () => deps }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); } finally { await new Promise((resolve) => server.close(resolve)); }
}

test('http: the route reads the raw bytes, checks the header, and answers 200/400/405', async () => {
  const { db, calls } = fakeDb();
  await withRoute({ webhookSecret: SECRET, db }, async (base) => {
    const raw = JSON.stringify(captured());
    assert.equal((await fetch(base)).status, 405);
    assert.equal((await fetch(base, { method: 'POST', body: raw })).status, 400, 'no signature header');
    assert.equal((await fetch(base, { method: 'POST', headers: { 'x-razorpay-signature': 'a'.repeat(64) }, body: raw })).status, 400);
    assert.deepEqual(calls.marked, []);
    const ok = await fetch(base, { method: 'POST', headers: { 'x-razorpay-signature': sign(Buffer.from(raw)), 'content-type': 'application/json' }, body: raw });
    assert.equal(ok.status, 200);
    assert.equal(calls.marked.length, 1);
    const big = await fetch(base, { method: 'POST', body: 'x'.repeat(300 * 1024) });
    assert.equal(big.status, 413);
  });
});

test('http: a database failure is a 500 (Razorpay retries) and leaks nothing', async () => {
  const { db } = fakeDb();
  db.markPaid = async () => { throw new Error('connection refused db.internal password=hunter2'); };
  await withRoute({ webhookSecret: SECRET, db }, async (base) => {
    const raw = JSON.stringify(captured());
    const response = await fetch(base, { method: 'POST', headers: { 'x-razorpay-signature': sign(Buffer.from(raw)) }, body: raw });
    assert.equal(response.status, 500);
    const text = await response.text();
    assert.ok(!text.includes('hunter2') && !text.includes('db.internal'));
  });
});

test('http: the route never reads request.body (on Vercel that lazy property consumes the stream)', async () => {
  const { db, calls } = fakeDb();
  const handler = webhookRoute({ deps: () => ({ webhookSecret: SECRET, db }) });
  const raw = Buffer.from(JSON.stringify(captured()));
  let touched = false;
  const request = {
    method: 'POST',
    headers: { 'x-razorpay-signature': sign(raw) },
    get body() { touched = true; return {}; }, // what Vercel does: parse on first access
    async *[Symbol.asyncIterator]() { yield raw; },
  };
  const written = {};
  await handler(request, { writeHead(status) { written.status = status; }, end() {} });
  assert.equal(touched, false);
  assert.equal(written.status, 200);
  assert.equal(calls.marked.length, 1);
});

test('http: an empty body (already consumed upstream) is refused, never recorded', async () => {
  const { db, calls } = fakeDb();
  await withRoute({ webhookSecret: SECRET, db }, async (base) => {
    const response = await fetch(base, { method: 'POST', headers: { 'x-razorpay-signature': sign(Buffer.alloc(0)) } });
    assert.equal(response.status, 400, 'a valid signature over nothing is still not a payment');
    assert.deepEqual(calls.marked, []);
  });
});

test('config: the webhook secret is required, and named when missing', () => {
  assert.throws(() => readWebhookSecret({}), (e) => e instanceof ConfigError && /RAZORPAY_WEBHOOK_SECRET/.test(e.message));
  assert.equal(readWebhookSecret({ RAZORPAY_WEBHOOK_SECRET: ' s ' }), 's');
});
