import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

/*
 * The only code that talks to the database. It uses the service role, which
 * bypasses row level security, so it must stay on the server and every query
 * here is a bound filter (no SQL text is assembled).
 */

const check = ({ data, error }) => {
  if (error) throw error;
  return data;
};

export function createDb(config, client = createClient(config.supabaseUrl, config.serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  // The client builds a realtime socket even though we only run queries; on
  // Node 20 (no built-in WebSocket) that throws unless one is supplied.
  realtime: { transport: ws },
})) {
  return {
    async findRegistration(code, email) {
      return check(await client.from('event_registrations')
        .select('id, event_slug')
        .eq('registration_code', code)
        .eq('email', email) // stored lower-cased by register_participant
        .maybeSingle());
    },

    async getEventFee(slug) {
      if (!slug) return null;
      const row = check(await client.from('event_settings').select('fee_paise').eq('slug', slug).maybeSingle());
      return row?.fee_paise ?? null;
    },

    async listPayments(registrationId) {
      return check(await client.from('payments')
        .select('razorpay_order_id, amount_paise, status')
        .eq('registration_id', registrationId)
        .order('created_at', { ascending: false }));
    },

    async insertPayment(row) {
      check(await client.from('payments').insert(row));
    },

    async findPaymentByOrder(orderId) {
      return check(await client.from('payments')
        .select('status, razorpay_payment_id, amount_paise')
        .eq('razorpay_order_id', orderId)
        .maybeSingle());
    },

    /* True if this call marked the row paid; false if it was already paid. */
    async markPaid({ orderId, paymentId }) {
      const rows = check(await client.from('payments')
        .update({ status: 'paid', razorpay_payment_id: paymentId, paid_at: new Date().toISOString() })
        .eq('razorpay_order_id', orderId)
        .eq('status', 'created') // the guard that makes this safe to repeat
        .select('registration_id'));
      if (!rows.length) return false;
      check(await client.from('event_registrations').update({ payment: true }).eq('id', rows[0].registration_id));
      return true;
    },
  };
}
