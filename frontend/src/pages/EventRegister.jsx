import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { getEvent, eventPath } from '@jsro/shared/events';
import { site } from '@jsro/shared/site';
import { supabase } from '../lib/supabase';
import { findRegistrationCode, payForRegistration } from '../lib/payments';
import { collectErrors, focusFirstError, isEmail } from '../lib/formErrors';
import '../components/Form.css';
import './EventRegister.css';

const EMPTY = { name: '', email: '', phone: '', school: '' };

const RULES = [
  { field: 'name', message: 'Add your name.' },
  { field: 'email', message: 'Add an email address.' },
  { field: 'email', message: 'That email address looks incomplete.', test: isEmail },
  { field: 'phone', message: 'Add a number JSRO can reach you on.' },
  { field: 'school', message: 'Tell us where you are studying or working.' },
];

const PAYMENT_ID = /^pay_[A-Za-z0-9]{8,40}$/;

// For someone who paid but never saw their code (closed the tab, lost
// connection): the email plus the payment ID from Razorpay's receipt email.
function FindCode() {
  const [email, setEmail] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [result, setResult] = useState({ busy: false, code: null, error: null });

  const submit = async (e) => {
    e.preventDefault();
    if (!isEmail(email.trim()) || !PAYMENT_ID.test(paymentId.trim())) {
      setResult({ busy: false, code: null, error: 'Enter your email and the payment ID from your Razorpay receipt email. It starts with pay_.' });
      return;
    }
    setResult({ busy: true, code: null, error: null });
    try {
      const code = await findRegistrationCode({ email: email.trim(), paymentId: paymentId.trim() });
      setResult({ busy: false, code, error: null });
    } catch (error) {
      setResult({ busy: false, code: null, error: error.message });
    }
  };

  return (
    <details className="find-code">
      <summary>Already paid? Get your code</summary>
      <p className="jsro-form-hint">
        Use the email you registered with and the payment ID from the receipt Razorpay emailed you.
      </p>
      <form className="jsro-form" onSubmit={submit} noValidate>
        <div className="jsro-form-row">
          <label htmlFor="find-email">Email you registered with</label>
          <input id="find-email" type="email" inputMode="email" autoComplete="email" spellCheck="false" autoCapitalize="none"
            value={email} onChange={(e) => setEmail(e.target.value)} disabled={result.busy} />
        </div>
        <div className="jsro-form-row">
          <label htmlFor="find-payment">Payment ID</label>
          <input id="find-payment" autoComplete="off" spellCheck="false" autoCapitalize="none" placeholder="pay_…"
            value={paymentId} onChange={(e) => setPaymentId(e.target.value)} disabled={result.busy} />
        </div>
        {result.error && <p className="jsro-form-status" data-tone="error" role="alert">{result.error}</p>}
        {result.code && (
          <p className="jsro-form-status" data-tone="success" role="status">
            Your registration code is <strong translate="no">{result.code}</strong>. Keep it: you need it, with your email, to submit your project.
          </p>
        )}
        <div className="jsro-form-actions">
          <button className="jsro-quiet-action find-code-button" type="submit" disabled={result.busy}>
            {result.busy ? 'Looking…' : 'Show my code'}
          </button>
        </div>
      </form>
    </details>
  );
}

export default function EventRegister() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const event = getEvent(slug);
  // An event with a fee is registered for and paid for in one step; its code
  // is shown only after the payment is verified.
  const paidFlow = Boolean(event?.paymentsOpen && event?.fee);

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

  if (event && !event.registrationOpen) {
    return (
      <div className="jsro-page">
        <SiteHeader />
        <main id="main-content" className="jsro-main jsro-measure">
          <p className="jsro-effective">Coming soon</p>
          <h1 className="jsro-page-title">Registration for {event.title} has not opened yet.</h1>
          <p className="jsro-page-intro">
            JSRO is finalising dates and cost. Message the team and they will send the
            outline as soon as it is ready.
          </p>
          <p style={{ marginTop: 34 }}>
            <a className="jsro-action" href={`mailto:${site.email}?subject=${encodeURIComponent(event.title)}`}>
              Email JSRO <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />
            </a>
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="jsro-page">
        <SiteHeader />
        <main id="main-content" className="jsro-main jsro-measure">
          <h1 className="jsro-page-title">That event is not listed.</h1>
          <p className="jsro-page-intro">
            The link may be out of date. The current programmes are on the homepage.
          </p>
          <p style={{ marginTop: 34 }}>
            <Link className="jsro-action" to="/#events">
              See the events <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const change = (e) => {
    const { name, value } = e.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => (previous[name] ? { ...previous, [name]: undefined } : previous));
  };

  const field = (name) => ({
    name,
    id: `register-${name}`,
    value: values[name],
    onChange: change,
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `register-${name}-error` : undefined,
  });

  const submit = async (e) => {
    e.preventDefault();

    const found = collectErrors(values, RULES);
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirstError(found, RULES, formRef.current);
      return;
    }

    setSaving(true);
    setStatus(null);

    if (paidFlow) {
      setStatus({ tone: 'info', message: 'Saving your details and opening secure payment…' });
      try {
        const result = await payForRegistration({
          details: {
            event_slug: event.slug,
            name: values.name.trim(),
            email: values.email.trim(),
            phone: values.phone.trim(),
            school: values.school.trim(),
          },
          description: `${event.title} entry fee`,
          onFailed: (message) => setStatus({ tone: 'error', message: `${message} You can try again in the payment window.` }),
        });
        if (result.status === 'paid') {
          navigate('/thank-you', {
            state: { eventSlug: event.slug, name: values.name, email: values.email, code: result.registrationCode, paid: true, paymentId: result.paymentId },
          });
          return;
        }
        if (result.status === 'cancelled') {
          setStatus({ tone: 'info', message: 'The payment window was closed and nothing was charged. Your details are saved: press Register and pay to continue.' });
        } else {
          setStatus({
            tone: 'error',
            message: `We could not confirm your payment. If money left your account, do not pay again: use "Already paid? Get your code" below with payment ID ${result.paymentId}, or contact JSRO.`,
          });
        }
      } catch (error) {
        setStatus({ tone: 'error', message: error.message });
      } finally {
        setSaving(false);
      }
      return;
    }

    // The database generates the registration code and enforces whether
    // registration is open. Direct inserts into the table are not permitted.
    const { data: code, error } = await supabase.rpc('register_participant', {
      p_event_slug: event.slug,
      p_name: values.name,
      p_email: values.email,
      p_phone: values.phone,
      p_school: values.school,
    });

    setSaving(false);

    if (error) {
      // P0001 messages are written for the visitor; anything else is a fault.
      const message = error.code === 'P0001'
        ? error.message
        : 'Registration could not be completed. Check your connection and try again, or email JSRO.';
      setStatus({ tone: 'error', message });
      return;
    }

    navigate('/thank-you', { state: { eventSlug: event.slug, name: values.name, email: values.email, code } });
  };

  return (
    <div className="jsro-page">
      <SiteHeader />

      <main id="main-content" className="jsro-main register-main">
        <div className="register-intro">
          <Link className="jsro-quiet-action register-back" to={eventPath(event)}>
            Back to {event.shortTitle}
          </Link>
          <h1 className="jsro-page-title">Register</h1>
          <p className="jsro-page-intro">{event.title}</p>

          <dl className="register-facts">
            <div>
              <dt>When</dt>
              <dd>{event.date || 'To be announced'}</dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>{event.location || 'To be announced'}</dd>
            </div>
            <div>
              <dt>Fee</dt>
              <dd>{event.fee || 'Contact JSRO for fees'}</dd>
            </div>
          </dl>
        </div>

        <div className="register-side">
        <form className="jsro-form" onSubmit={submit} ref={formRef} noValidate>
          <div className="jsro-form-row">
            <label htmlFor="register-name">Full name</label>
            <input {...field('name')} autoComplete="name" placeholder="Aarav Mehta…" />
            {errors.name && <p className="jsro-field-error" id="register-name-error">{errors.name}</p>}
          </div>

          <div className="jsro-form-row">
            <label htmlFor="register-email">Email</label>
            <input {...field('email')} type="email" inputMode="email" autoComplete="email" spellCheck="false" autoCapitalize="none" placeholder="name@example.com…" />
            {errors.email && <p className="jsro-field-error" id="register-email-error">{errors.email}</p>}
          </div>

          <div className="jsro-form-row">
            <label htmlFor="register-phone">Phone</label>
            <input {...field('phone')} type="tel" inputMode="tel" autoComplete="tel" spellCheck="false" placeholder="+91 98765 43210…" />
            {errors.phone && <p className="jsro-field-error" id="register-phone-error">{errors.phone}</p>}
          </div>

          <div className="jsro-form-row">
            <label htmlFor="register-school">School, college or organisation</label>
            <input {...field('school')} autoComplete="organization" placeholder="St. Xavier's Senior Secondary…" />
            {errors.school && <p className="jsro-field-error" id="register-school-error">{errors.school}</p>}
          </div>

          {status && (
            <p className="jsro-form-status" data-tone={status.tone} role="status" aria-live="polite">
              {status.message}
            </p>
          )}

          {paidFlow && (
            <p className="jsro-form-hint">
              The {event.fee} entry fee is paid as part of registering, through Razorpay (UPI, cards, netbanking).
              Your registration code appears as soon as the payment goes through.
            </p>
          )}

          <div className="jsro-form-actions">
            <button className="jsro-action" type="submit" disabled={saving}>
              {saving ? 'Working…' : paidFlow ? `Register and pay ${event.fee}` : 'Confirm Registration'}
              {!saving && <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />}
            </button>
          </div>
        </form>
        {paidFlow && <FindCode />}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
