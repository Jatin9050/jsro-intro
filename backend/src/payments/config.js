/*
 * Everything the payments API needs from the environment, read once and
 * checked. The key secret and the service role key exist only here, on the
 * server; nothing in this folder is ever imported by the frontend.
 */

export class ConfigError extends Error {}

const REQUIRED = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

export function readWebhookSecret(env = process.env) {
  const secret = String(env.RAZORPAY_WEBHOOK_SECRET || '').trim();
  if (!secret) throw new ConfigError('Payments are not configured. Missing: RAZORPAY_WEBHOOK_SECRET');
  return secret;
}

export function readConfig(env = process.env) {
  const missing = REQUIRED.filter((name) => !String(env[name] || '').trim());
  if (missing.length) {
    throw new ConfigError(`Payments are not configured. Missing: ${missing.join(', ')}`);
  }
  const keyId = env.RAZORPAY_KEY_ID.trim();
  if (!/^rzp_(test|live)_[A-Za-z0-9]+$/.test(keyId)) {
    throw new ConfigError('RAZORPAY_KEY_ID does not look like a Razorpay key id.');
  }
  return {
    keyId,
    keySecret: env.RAZORPAY_KEY_SECRET.trim(),
    supabaseUrl: env.SUPABASE_URL.trim(),
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY.trim(),
  };
}
