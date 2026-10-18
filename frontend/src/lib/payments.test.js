import { PaymentError, findRegistrationCode, loadCheckout, payForRegistration } from './payments';

const CODE = 'IC26-K7M4-Q9TX';
const EMAIL = 'aarav@example.com';
const DETAILS = { event_slug: 'innovation-challenge', name: 'Aarav Mehta', email: EMAIL, phone: '+91 98765 43210', school: 'DPS Hisar' };
const json = (status, body) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

let razorpayOptions;
let handlers;

beforeEach(() => {
  razorpayOptions = null;
  handlers = {};
  global.fetch = jest.fn();
  window.Razorpay = function Razorpay(options) {
    razorpayOptions = options;
    this.on = (name, fn) => { handlers[name] = fn; };
    this.open = jest.fn();
  };
});
afterEach(() => { delete window.Razorpay; });

const order = { order_id: 'order_Abc12345678', amount: 10000, currency: 'INR', key_id: 'rzp_test_fromserver' };

test('sends the registration form to create the order (no amount, no code)', async () => {
  global.fetch.mockReturnValueOnce(json(200, order));
  const done = payForRegistration({ details: DETAILS, description: 'Challenge' });
  await new Promise((resolve) => setTimeout(resolve, 0));
  const [url, init] = global.fetch.mock.calls[0];
  expect(url).toBe('/api/create-order');
  expect(init.method).toBe('POST');
  expect(init.headers['Content-Type']).toBe('application/json');
  expect(JSON.parse(init.body)).toEqual(DETAILS);
  razorpayOptions.modal.ondismiss();
  await done;
});

test('opens checkout for that order, with the amount the server decided', async () => {
  global.fetch.mockReturnValueOnce(json(200, order));
  const done = payForRegistration({ details: DETAILS, description: 'Challenge' });
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(razorpayOptions).toMatchObject({ order_id: order.order_id, amount: 10000, currency: 'INR', key: 'rzp_test_fromserver', prefill: { name: 'Aarav Mehta', email: EMAIL, contact: '+919876543210' } });
  expect(JSON.stringify(razorpayOptions)).not.toMatch(/secret/i);
  razorpayOptions.modal.ondismiss();
  await done;
});

test('success: all three values go to the verify endpoint, and the code comes back from it', async () => {
  global.fetch.mockReturnValueOnce(json(200, order)).mockReturnValueOnce(json(200, { verified: true, registration_code: CODE }));
  const done = payForRegistration({ details: DETAILS, description: 'x' });
  await new Promise((resolve) => setTimeout(resolve, 0));
  await razorpayOptions.handler({ razorpay_order_id: order.order_id, razorpay_payment_id: 'pay_Xyz12345678', razorpay_signature: 'a'.repeat(64) });
  await expect(done).resolves.toEqual({ status: 'paid', registrationCode: CODE, paymentId: 'pay_Xyz12345678' });
  const [url, init] = global.fetch.mock.calls[1];
  expect(url).toBe('/api/verify-payment');
  expect(JSON.parse(init.body)).toEqual({ razorpay_order_id: order.order_id, razorpay_payment_id: 'pay_Xyz12345678', razorpay_signature: 'a'.repeat(64) });
});

test('success at Razorpay but the server cannot verify: "unconfirmed", never "paid"', async () => {
  global.fetch.mockReturnValueOnce(json(200, order)).mockReturnValueOnce(json(400, { error: 'The payment could not be verified.' }));
  const done = payForRegistration({ details: DETAILS, description: 'x' });
  await new Promise((resolve) => setTimeout(resolve, 0));
  await razorpayOptions.handler({ razorpay_order_id: order.order_id, razorpay_payment_id: 'pay_Xyz12345678', razorpay_signature: 'b'.repeat(64) });
  await expect(done).resolves.toEqual({ status: 'unconfirmed', paymentId: 'pay_Xyz12345678' });
});

test('success at Razorpay but the network drops during verification: "unconfirmed"', async () => {
  global.fetch.mockReturnValueOnce(json(200, order)).mockRejectedValueOnce(new TypeError('Failed to fetch'));
  const done = payForRegistration({ details: DETAILS, description: 'x' });
  await new Promise((resolve) => setTimeout(resolve, 0));
  await razorpayOptions.handler({ razorpay_order_id: order.order_id, razorpay_payment_id: 'pay_Xyz12345678', razorpay_signature: 'c'.repeat(64) });
  await expect(done).resolves.toEqual({ status: 'unconfirmed', paymentId: 'pay_Xyz12345678' });
});

test('closing the window is "cancelled"', async () => {
  global.fetch.mockReturnValueOnce(json(200, order));
  const done = payForRegistration({ details: DETAILS, description: 'x' });
  await new Promise((resolve) => setTimeout(resolve, 0));
  razorpayOptions.modal.ondismiss();
  await expect(done).resolves.toEqual({ status: 'cancelled' });
});

test('payment.failed is reported while the window stays open', async () => {
  global.fetch.mockReturnValueOnce(json(200, order));
  const onFailed = jest.fn();
  const done = payForRegistration({ details: DETAILS, description: 'x', onFailed });
  await new Promise((resolve) => setTimeout(resolve, 0));
  handlers['payment.failed']({ error: { description: 'Your card was declined.' } });
  expect(onFailed).toHaveBeenCalledWith('Your card was declined.');
  razorpayOptions.modal.ondismiss();
  await done;
});

test('messages written for the visitor (400/409) are shown; server faults are not', async () => {
  global.fetch.mockReturnValueOnce(json(409, { error: 'This registration is already paid.', already_paid: true }));
  await expect(payForRegistration({ details: DETAILS, description: 'x' })).rejects.toMatchObject({ message: 'This registration is already paid.', alreadyPaid: true });

  global.fetch.mockReturnValueOnce(json(500, { error: 'connection refused at db.internal' }));
  await expect(payForRegistration({ details: DETAILS, description: 'x' })).rejects.toMatchObject({ message: expect.not.stringContaining('db.internal') });

  global.fetch.mockReturnValueOnce(json(401, { error: 'rejected' }));
  await expect(payForRegistration({ details: DETAILS, description: 'x' })).rejects.toBeInstanceOf(PaymentError);
});

test('a network failure creating the order is a PaymentError, and checkout never opens', async () => {
  global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
  await expect(payForRegistration({ details: DETAILS, description: 'x' })).rejects.toThrow(/Could not reach JSRO/);
  expect(razorpayOptions).toBeNull();
});

test('a malformed order response never reaches checkout', async () => {
  global.fetch.mockReturnValueOnce(json(200, { order_id: 42, amount: 'lots' }));
  await expect(payForRegistration({ details: DETAILS, description: 'x' })).rejects.toBeInstanceOf(PaymentError);
  expect(razorpayOptions).toBeNull();
});

test('the checkout script is only added when asked for, from Razorpay, once', async () => {
  delete window.Razorpay;
  expect(document.querySelector('script[src*="razorpay"]')).toBeNull();
  const first = loadCheckout();
  const second = loadCheckout();
  const scripts = document.querySelectorAll('script[src*="razorpay"]');
  expect(scripts).toHaveLength(1);
  expect(scripts[0].src).toBe('https://checkout.razorpay.com/v1/checkout.js');
  window.Razorpay = function Razorpay() {};
  scripts[0].onload();
  await expect(first).resolves.toBe(window.Razorpay);
  await expect(second).resolves.toBe(window.Razorpay);
});

test('"already paid": email + payment id return the code; a miss shows the server message', async () => {
  global.fetch.mockReturnValueOnce(json(200, { registration_code: CODE }));
  await expect(findRegistrationCode({ email: EMAIL, paymentId: 'pay_Xyz12345678' })).resolves.toBe(CODE);
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ email: EMAIL, razorpay_payment_id: 'pay_Xyz12345678' });
  global.fetch.mockReturnValueOnce(json(404, { error: 'No paid registration matches that email and payment ID.' }));
  await expect(findRegistrationCode({ email: EMAIL, paymentId: 'pay_Xyz12345678' })).rejects.toThrow('No paid registration matches');
});
