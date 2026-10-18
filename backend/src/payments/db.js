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
    /* Database function: validates, creates or reuses the unpaid registration. */
    async startPaidRegistration({ eventSlug, name, email, phone, school }) {
      const rows = check(await client.rpc('start_paid_registration', {
        p_event_slug: eventSlug, p_name: name, p_email: email, p_phone: phone, p_school: school,
      }));
      const row = rows?.[0];
      return row ? { id: row.reg_id, event_slug: row.reg_event_slug, fee: row.reg_fee_paise } : null;
    },

    /* The code of the registration an order belongs to. Called only after verification. */
    async getCodeForOrder(orderId) {
      const row = check(await client.from('payments')
        .select('event_registrations(registration_code)')
        .eq('razorpay_order_id', orderId)
        .maybeSingle());
      return row?.event_registrations?.registration_code ?? null;
    },

    /* The registration a PAID payment belongs to, for "Already paid? Get your code". */
    async findPaidByPayment(paymentId) {
      const row = check(await client.from('payments')
        .select('status, event_registrations(email, registration_code, event_slug)')
        .eq('razorpay_payment_id', paymentId)
        .eq('status', 'paid')
        .maybeSingle());
      const reg = row?.event_registrations;
      return reg ? { email: (reg.email || '').toLowerCase(), registration_code: reg.registration_code, event_slug: reg.event_slug } : null;
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
