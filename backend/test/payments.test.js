import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { ConfigError, readConfig } from '../src/payments/config.js';
import { createDb } from '../src/payments/db.js';
import { createOrder, findRegistration, verifyPayment } from '../src/payments/handlers.js';
import { route } from '../src/payments/http.js';
import { sign, signatureMatches } from '../src/payments/signature.js';

const SECRET = 'unit-test-secret';
const config = { keyId: 'rzp_test_UnitTestKey', keySecret: SECRET, supabaseUrl: 'https://x.supabase.co', serviceRoleKey: 'service-role-test' };
const CODE = 'IC26-K7M4-Q9TX';
const EMAIL = 'aarav@example.com';
const ORDER = 'order_TestOrder0001';
const PAYMENT = 'pay_TestPayment0001';

/* ---- fakes: no network, every call recorded ---- */
function fakes(options = {}) {
  const { payments = [], razorpayError } = options;
  // `in`, not defaults: an explicit undefined or null must reach the code under test.
  const fee = 'fee' in options ? options.fee : 10000;
  const startError = options.startError;
  const calls = { orders: [], inserted: [], marked: [], started: [] };
  const state = { payments: [...payments] };
  const razorpay = {
    orders: {
      async create(args) {
        calls.orders.push(args);
        if (razorpayError) throw razorpayError;
        return 'razorpayOrder' in options ? options.razorpayOrder : { id: ORDER, amount: args.amount, currency: args.currency };
      },
    },
  };
  const db = {
    async startPaidRegistration(details) {
      calls.started.push(details);
      if (startError) throw startError;
      return { id: 'reg-1', event_slug: details.eventSlug, fee };
    },
    async listPayments() { return state.payments; },
    async insertPayment(row) { calls.inserted.push(row); },
    async findPaymentByOrder(orderId) { return state.payments.find((p) => p.razorpay_order_id === orderId) ?? null; },
    async markPaid(args) {
      calls.marked.push(args);
      const row = state.payments.find((p) => p.razorpay_order_id === args.orderId && p.status === 'created');
      if (!row) return false;
      row.status = 'paid';
      row.razorpay_payment_id = args.paymentId;
      return true;
    },
    async getCodeForOrder(orderId) { return state.payments.some((p) => p.razorpay_order_id === orderId) ? CODE : null; },
    async findPaidByPayment(paymentId) {
      const row = state.payments.find((p) => p.razorpay_payment_id === paymentId && p.status === 'paid');
      return row ? { email: EMAIL, registration_code: CODE, event_slug: 'innovation-challenge' } : null;
    },
  };
  return { deps: { config, razorpay, db }, calls, state };
}
const pending = { razorpay_order_id: ORDER, amount_paise: 10000, status: 'created' };
const goodBody = { event_slug: 'innovation-challenge', name: 'Aarav Mehta', email: EMAIL, phone: '9876543210', school: 'DPS Hisar' };
const verification = (over = {}) => ({
  razorpay_order_id: ORDER,
  razorpay_payment_id: PAYMENT,
  razorpay_signature: sign(ORDER, PAYMENT, SECRET),
  ...over,
});
const p0001 = (message) => Object.assign(new Error(message), { code: 'P0001' });

/* ------------------------------------------------------------- signature */
test('signature matches an independently computed HMAC-SHA256 (openssl)', () => {
  const reference = 'b0c137d8c1fa88293e8c94c9e9d3eb417dd5f3f5cadc5693dd7a3ae7d50f6105';
  assert.equal(sign(ORDER, PAYMENT, SECRET), reference);
  assert.ok(signatureMatches({ orderId: ORDER, paymentId: PAYMENT, signature: reference, secret: SECRET }));
});

test('signature check rejects wrong, short, non-hex and non-string signatures', () => {
  const good = sign(ORDER, PAYMENT, SECRET);
  for (const signature of [good.replace(/.$/, good.endsWith('0') ? '1' : '0'), good.slice(1), 'zz'.repeat(32), '', null, 12345, undefined]) {
    assert.equal(signatureMatches({ orderId: ORDER, paymentId: PAYMENT, signature, secret: SECRET }), false, String(signature));
  }
  assert.equal(signatureMatches({ orderId: ORDER, paymentId: PAYMENT, signature: good, secret: 'other-secret' }), false);
  assert.equal(signatureMatches({ orderId: 'order_Different0001', paymentId: PAYMENT, signature: good, secret: SECRET }), false);
});

/* ---------------------------------------------------------- create order */
test('create-order: an incomplete or malformed form is refused before anything is called', async () => {
  for (const body of [null, undefined, 'x', [], {}, { ...goodBody, name: '' }, { ...goodBody, email: '   ' },
    { ...goodBody, event_slug: '../../etc' }, { ...goodBody, event_slug: 'Innovation Challenge' }, { ...goodBody, phone: 9876543210 },
    { ...goodBody, school: { $ne: '' } }, { ...goodBody, name: 'x'.repeat(201) }]) {
    const { deps, calls } = fakes();
    const result = await createOrder(body, deps);
    assert.equal(result.status, 400, JSON.stringify(body)?.slice(0, 80));
    assert.deepEqual(calls.started, []);
    assert.deepEqual(calls.orders, []);
  }
});

test('create-order: the form goes to the database function as given (it does the real validation)', async () => {
  const { deps, calls } = fakes();
  await createOrder(goodBody, deps);
  assert.deepEqual(calls.started, [{ eventSlug: 'innovation-challenge', name: 'Aarav Mehta', email: EMAIL, phone: '9876543210', school: 'DPS Hisar' }]);
});

test('create-order: the database refusing (closed, invalid, already paid) is a 400 with its own message', async () => {
  for (const message of ['Registration for this event is not open yet.', 'Enter a valid phone number.']) {
    const { deps, calls } = fakes({ startError: p0001(message) });
    const result = await createOrder(goodBody, deps);
    assert.equal(result.status, 400);
    assert.equal(result.body.error, message);
    assert.deepEqual(calls.orders, []);
  }
  const { deps } = fakes({ startError: p0001('This email is already registered and paid for this event. Use "Already paid? Get your code" to see your registration code.') });
  const paid = await createOrder(goodBody, deps);
  assert.equal(paid.status, 400);
  assert.equal(paid.body.already_paid, true);
});

test('create-order: any other database failure is not shown to the visitor', async () => {
  const { deps } = fakes({ startError: Object.assign(new Error('connection refused db.internal'), { code: '08006' }) });
  await assert.rejects(createOrder(goodBody, deps), /connection refused/); // the route turns this into a generic 500
});

test('create-order: the amount comes from the database, never from the request', async () => {
  const { deps, calls } = fakes({ fee: 10000 });
  const result = await createOrder({ ...goodBody, amount: 1, currency: 'USD', fee_paise: 100 }, deps);
  assert.equal(result.status, 200);
  assert.equal(calls.orders[0].amount, 10000);
  assert.equal(calls.orders[0].currency, 'INR');
  assert.equal(calls.orders[0].receipt, 'reg-1');
});

test('create-order: success returns the order and never the registration code or a secret', async () => {
  const { deps, calls } = fakes();
  const result = await createOrder(goodBody, deps);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { order_id: ORDER, amount: 10000, currency: 'INR', key_id: config.keyId });
  assert.deepEqual(calls.inserted, [{ registration_id: 'reg-1', razorpay_order_id: ORDER, amount_paise: 10000 }]);
  assert.ok(!JSON.stringify(result).includes(SECRET));
  assert.ok(!JSON.stringify(result).includes(CODE), 'the code is only released after payment');
});

test('create-order: no fee, or a fee below the Razorpay minimum -> 409, Razorpay never called', async () => {
  for (const fee of [null, undefined, 0, 99, -500, 100.5, '10000']) {
    const { deps, calls } = fakes({ fee });
    const result = await createOrder(goodBody, deps);
    assert.equal(result.status, 409, String(fee));
    assert.deepEqual(calls.orders, []);
  }
  const { deps } = fakes({ fee: 100 });
  assert.equal((await createOrder(goodBody, deps)).status, 200, 'exactly 100 paise is allowed');
});

test('create-order: an already paid registration cannot be charged twice', async () => {
  const { deps, calls } = fakes({ payments: [{ ...pending, status: 'paid' }] });
  const result = await createOrder(goodBody, deps);
  assert.equal(result.status, 409);
  assert.equal(result.body.already_paid, true);
  assert.deepEqual(calls.orders, []);
});

test('create-order: coming back reuses the open order instead of making another', async () => {
  const { deps, calls } = fakes({ payments: [pending] });
  const result = await createOrder(goodBody, deps);
  assert.equal(result.status, 200);
  assert.equal(result.body.order_id, ORDER);
  assert.deepEqual(calls.orders, []);
  assert.deepEqual(calls.inserted, []);
});

test('create-order: an open order for an old fee is not reused', async () => {
  const { deps, calls } = fakes({ fee: 15000, payments: [pending] });
  const result = await createOrder(goodBody, deps);
  assert.equal(result.status, 200);
  assert.equal(calls.orders[0].amount, 15000);
});

test('create-order: Razorpay rejecting our credentials -> 401, without internals', async () => {
  const { deps, calls } = fakes({ razorpayError: { statusCode: 401, error: { code: 'BAD_REQUEST_ERROR', description: 'Authentication failed rzp_test_secretish' } } });
  const result = await createOrder(goodBody, deps);
  assert.equal(result.status, 401);
  assert.ok(!JSON.stringify(result).includes('Authentication failed'));
  assert.deepEqual(calls.inserted, []);
});

test('create-order: any other Razorpay failure -> 500 with a generic message', async () => {
  const { deps, calls } = fakes({ razorpayError: { statusCode: 400, error: { code: 'BAD_REQUEST_ERROR', description: 'The amount must be at least INR 1.00' } } });
  const result = await createOrder(goodBody, deps);
  assert.equal(result.status, 500);
  assert.ok(!JSON.stringify(result).includes('INR 1.00'));
  assert.deepEqual(calls.inserted, []);
});

test('create-order: a Razorpay answer that does not match what we asked for is not trusted', async () => {
  for (const razorpayOrder of [{ id: ORDER, amount: 100, currency: 'INR' }, { id: ORDER, amount: 10000, currency: 'USD' }, { id: '../etc', amount: 10000, currency: 'INR' }, null]) {
    const { deps, calls } = fakes({ razorpayOrder });
    const result = await createOrder(goodBody, deps);
    assert.equal(result.status, 500, JSON.stringify(razorpayOrder));
    assert.deepEqual(calls.inserted, []);
  }
});

/* -------------------------------------------------------- verify payment */
test('verify: a genuine signature marks the order paid and only then hands out the code', async () => {
  const { deps, calls } = fakes({ payments: [{ ...pending }] });
  const result = await verifyPayment(verification(), deps);
  assert.equal(result.status, 200);
  assert.equal(result.body.verified, true);
  assert.equal(result.body.registration_code, CODE);
  assert.deepEqual(calls.marked, [{ orderId: ORDER, paymentId: PAYMENT }]);
});

test('verify: a wrong signature is a 400 and nothing is marked paid', async () => {
  const forged = [
    verification({ razorpay_signature: 'a'.repeat(64) }),
    verification({ razorpay_signature: sign(ORDER, PAYMENT, 'attacker-guess') }),
    verification({ razorpay_payment_id: 'pay_SomeoneElse0001' }),            // signature for a different payment
    verification({ razorpay_order_id: 'order_AnotherOrder01' }),             // signature for a different order
  ];
  for (const body of forged) {
    const { deps, calls } = fakes({ payments: [{ ...pending }, { ...pending, razorpay_order_id: 'order_AnotherOrder01' }] });
    const result = await verifyPayment(body, deps);
    assert.equal(result.status, 400);
    assert.deepEqual(calls.marked, []);
    assert.ok(!JSON.stringify(result).includes(CODE), 'no code for a forged payment');
  }
});

test('verify: missing or malformed fields are a 400', async () => {
  for (const body of [null, {}, 'x', verification({ razorpay_signature: undefined }), verification({ razorpay_order_id: undefined }),
    verification({ razorpay_payment_id: 42 }), verification({ razorpay_order_id: "order_x'; drop table payments;--" }),
    verification({ razorpay_signature: ['a'.repeat(64)] })]) {
    const { deps, calls } = fakes({ payments: [{ ...pending }] });
    const result = await verifyPayment(body, deps);
    assert.equal(result.status, 400);
    assert.deepEqual(calls.marked, []);
  }
});

test('verify: a valid signature for an order we never created is not recorded', async () => {
  const { deps, calls } = fakes({ payments: [] });
  const result = await verifyPayment(verification(), deps);
  assert.equal(result.status, 404);
  assert.deepEqual(calls.marked, []);
});

test('verify: repeating it is harmless', async () => {
  const { deps, calls } = fakes({ payments: [{ ...pending }] });
  assert.equal((await verifyPayment(verification(), deps)).status, 200);
  const again = await verifyPayment(verification(), deps);
  assert.equal(again.status, 200);
  assert.equal(again.body.already_recorded, true);
  assert.equal(again.body.registration_code, CODE, 'the webhook may have recorded it first; the buyer still gets the code');
  assert.equal(calls.marked.length, 1);
});

test('verify: losing a race with another verification still ends paid', async () => {
  const { deps, state } = fakes({ payments: [{ ...pending }] });
  deps.db.markPaid = async () => { state.payments[0].status = 'paid'; return false; };
  const result = await verifyPayment(verification(), deps);
  assert.equal(result.status, 200);
});

/* ------------------------------------------- already paid? get your code */
test('find-registration: the email and a paid payment id give back the code', async () => {
  const { deps } = fakes({ payments: [{ ...pending, status: 'paid', razorpay_payment_id: PAYMENT }] });
  const result = await findRegistration({ email: ' Aarav@Example.com ', razorpay_payment_id: PAYMENT }, deps);
  assert.equal(result.status, 200);
  assert.equal(result.body.registration_code, CODE);
});

test('find-registration: wrong email, unknown payment and unpaid payment all get the same answer', async () => {
  const { deps } = fakes({ payments: [{ ...pending, status: 'paid', razorpay_payment_id: PAYMENT }, { ...pending, razorpay_order_id: 'order_Unpaid000001', razorpay_payment_id: 'pay_NotPaidYet0001' }] });
  const answers = await Promise.all([
    findRegistration({ email: 'someone@else.co', razorpay_payment_id: PAYMENT }, deps),
    findRegistration({ email: EMAIL, razorpay_payment_id: 'pay_DoesNotExist01' }, deps),
    findRegistration({ email: EMAIL, razorpay_payment_id: 'pay_NotPaidYet0001' }, deps),
  ]);
  for (const answer of answers) assert.equal(answer.status, 404);
  assert.equal(new Set(answers.map((a) => JSON.stringify(a))).size, 1);
});

test('find-registration: malformed input is a 400', async () => {
  const { deps } = fakes();
  for (const body of [null, {}, { email: EMAIL }, { email: EMAIL, razorpay_payment_id: 'order_x' }, { email: 'nope', razorpay_payment_id: PAYMENT }, { email: EMAIL, razorpay_payment_id: ["pay_x'; --"] }]) {
    assert.equal((await findRegistration(body, deps)).status, 400, JSON.stringify(body));
  }
});

/* ------------------------------------------------------------------ http */
async function withServer(handler, deps, run) {
  const server = createServer(route(handler, { deps: () => deps }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try { await run(base); } finally { await new Promise((resolve) => server.close(resolve)); }
}
const post = (base, body, headers = { 'content-type': 'application/json' }) =>
  fetch(base, { method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body) });

test('http: only JSON POSTs are accepted, and no CORS headers are ever sent', async () => {
  const { deps } = fakes();
  await withServer(createOrder, deps, async (base) => {
    assert.equal((await fetch(base)).status, 405);
    assert.equal((await fetch(base, { method: 'PUT' })).status, 405);
    assert.equal((await post(base, 'registration_code=x', { 'content-type': 'application/x-www-form-urlencoded' })).status, 415);
    assert.equal((await post(base, JSON.stringify(goodBody), { 'content-type': 'text/plain' })).status, 415);
    assert.equal((await post(base, '{not json')).status, 400);
    assert.equal((await post(base, JSON.stringify({ a: 'x'.repeat(20000) }))).status, 413);
    const ok = await post(base, goodBody);
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get('cache-control'), 'no-store');
    assert.equal(ok.headers.get('access-control-allow-origin'), null);
    assert.match(ok.headers.get('content-type'), /application\/json/);
  });
});

test('http: missing configuration is a generic 500 that names no variable', async () => {
  const server = createServer(route(createOrder, { deps: () => { throw new ConfigError('Missing: RAZORPAY_KEY_SECRET'); } }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await post(`http://127.0.0.1:${server.address().port}`, goodBody);
    assert.equal(response.status, 500);
    assert.ok(!(await response.text()).includes('RAZORPAY'));
  } finally { await new Promise((resolve) => server.close(resolve)); }
});

test('http: an unexpected crash does not leak its message', async () => {
  const { deps } = fakes();
  deps.db.startPaidRegistration = async () => { throw new Error('connection refused at db.internal:5432 password=hunter2'); };
  await withServer(createOrder, deps, async (base) => {
    const response = await post(base, goodBody);
    assert.equal(response.status, 500);
    const text = await response.text();
    assert.ok(!text.includes('hunter2') && !text.includes('db.internal'));
  });
});

/* ---------------------------------------------------------------- config */
test('config: every missing variable is named, and a malformed key id is refused', () => {
  assert.throws(() => readConfig({}), (error) => error instanceof ConfigError && /RAZORPAY_KEY_ID.*RAZORPAY_KEY_SECRET.*SUPABASE_URL.*SUPABASE_SERVICE_ROLE_KEY/.test(error.message));
  assert.throws(() => readConfig({ RAZORPAY_KEY_ID: 'not-a-key', RAZORPAY_KEY_SECRET: 'x', SUPABASE_URL: 'https://x', SUPABASE_SERVICE_ROLE_KEY: 'y' }), ConfigError);
  const ok = readConfig({ RAZORPAY_KEY_ID: ' rzp_test_abc123 ', RAZORPAY_KEY_SECRET: ' s ', SUPABASE_URL: 'https://x', SUPABASE_SERVICE_ROLE_KEY: ' y ' });
  assert.deepEqual(ok, { keyId: 'rzp_test_abc123', keySecret: 's', supabaseUrl: 'https://x', serviceRoleKey: 'y' });
});

/* -------------------------------------------------------------------- db */
function fakeSupabase(responses = {}) {
  const log = [];
  const client = {
    from(table) {
      const step = { table, ops: [] };
      const chain = new Proxy({}, {
        get(_, name) {
          if (name === 'then') {
            return (resolve) => { log.push(step); resolve(responses[`${table}.${step.ops.find(([op]) => ['select', 'insert', 'update'].includes(op))?.[0]}`] ?? { data: null, error: null }); };
          }
          return (...args) => { step.ops.push([name, ...args]); return chain; };
        },
      });
      return chain;
    },
  };
  return { client, log };
}
const has = (step, op, ...args) => step.ops.some((o) => o[0] === op && args.every((a, i) => JSON.stringify(o[i + 1]) === JSON.stringify(a)));

test('db: the registration goes to the database function as bound parameters, and no code is read', async () => {
  const calls = [];
  const client = { rpc: async (name, args) => { calls.push([name, args]); return { data: [{ reg_id: 'reg-1', reg_event_slug: 'innovation-challenge', reg_fee_paise: 10000 }], error: null }; } };
  const result = await createDb(config, client).startPaidRegistration({ eventSlug: 'innovation-challenge', name: 'A B', email: 'a@b.co', phone: '9876543210', school: 'S' });
  assert.deepEqual(calls, [['start_paid_registration', { p_event_slug: 'innovation-challenge', p_name: 'A B', p_email: 'a@b.co', p_phone: '9876543210', p_school: 'S' }]]);
  assert.deepEqual(result, { id: 'reg-1', event_slug: 'innovation-challenge', fee: 10000 });
});

test('db: the code lookup for "already paid" only matches PAID payments', async () => {
  const { client, log } = fakeSupabase({ 'payments.select': { data: { status: 'paid', event_registrations: { email: 'Aarav@Example.com', registration_code: CODE, event_slug: 'x' } }, error: null } });
  const found = await createDb(config, client).findPaidByPayment(PAYMENT);
  assert.ok(has(log[0], 'eq', 'razorpay_payment_id', PAYMENT) && has(log[0], 'eq', 'status', 'paid'));
  assert.equal(found.email, 'aarav@example.com');
});

test('db: markPaid only touches rows still "created", and skips the registration if nothing changed', async () => {
  const none = fakeSupabase({ 'payments.update': { data: [], error: null } });
  assert.equal(await createDb(config, none.client).markPaid({ orderId: ORDER, paymentId: PAYMENT }), false);
  assert.ok(has(none.log[0], 'eq', 'status', 'created'));
  assert.equal(none.log.length, 1, 'event_registrations not touched');

  const one = fakeSupabase({ 'payments.update': { data: [{ registration_id: 'reg-1' }], error: null } });
  assert.equal(await createDb(config, one.client).markPaid({ orderId: ORDER, paymentId: PAYMENT }), true);
  assert.equal(one.log[1].table, 'event_registrations');
  assert.ok(has(one.log[1], 'update', { payment: true }) && has(one.log[1], 'eq', 'id', 'reg-1'));
});

test('db: the real Supabase client can be constructed (no network) on this Node version', () => {
  const db = createDb({ supabaseUrl: 'https://example.supabase.co', serviceRoleKey: 'service-role-test' });
  assert.equal(typeof db.startPaidRegistration, 'function');
});

test('db: a database error is thrown, never swallowed', async () => {
  const { client } = fakeSupabase({ 'payments.insert': { data: null, error: new Error('boom') } });
  await assert.rejects(createDb(config, client).insertPayment({}), /boom/);
});

/* ---------------------------------------------- the secret stays server-side */
test('the key secret and service role key appear nowhere in the frontend source', () => {
  const root = new URL('../../frontend/src', import.meta.url).pathname;
  const hits = [];
  (function walk(dir) {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(jsx?|css|json)$/.test(name) && /KEY_SECRET|SERVICE_ROLE|service_role|backend\/src/.test(readFileSync(path, 'utf8'))) hits.push(path);
    }
  })(root);
  assert.deepEqual(hits, []);
});
