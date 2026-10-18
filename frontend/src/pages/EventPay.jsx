import { useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { getEvent, eventPath } from '@jsro/shared/events';
import { site, whatsappUrl } from '@jsro/shared/site';
import { payForRegistration } from '../lib/payments';
import { collectErrors, focusFirstError, isEmail } from '../lib/formErrors';
import '../components/Form.css';
import './EventRegister.css';

// The shape the database produces; anything else cannot be a registration code.
const CODE_SHAPE = /^[A-Z0-9]{2,6}-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/;

const RULES = [
  { field: 'code', message: 'Enter the registration code you were given.' },
  { field: 'code', message: 'That code does not look right. It reads like IC26-7K4M-Q9TX.', test: (v) => CODE_SHAPE.test(v.trim().toUpperCase()) },
  { field: 'email', message: 'Enter the email address you registered with.' },
  { field: 'email', message: 'That email address looks incomplete.', test: isEmail },
];

function Notice({ children }) {
  return (
    <div className="jsro-page">
      <SiteHeader />
      <main id="main-content" className="jsro-main jsro-measure">{children}</main>
      <SiteFooter />
    </div>
  );
}

export default function EventPay() {
  const { slug } = useParams();
  const { state } = useLocation();
  const event = getEvent(slug);

  const [values, setValues] = useState({
    code: typeof state?.code === 'string' && CODE_SHAPE.test(state.code) ? state.code : '',
    email: typeof state?.email === 'string' ? state.email : '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [paid, setPaid] = useState(false);
  const formRef = useRef(null);

  if (!event || !event.fee) {
    return (
      <Notice>
        <h1 className="jsro-page-title">That event is not listed.</h1>
        <p className="jsro-page-intro">The link may be out of date. The current programmes are on the homepage.</p>
        <p style={{ marginTop: 34 }}>
          <Link className="jsro-action" to="/#events">See the events <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" /></Link>
        </p>
      </Notice>
    );
  }

  if (!event.paymentsOpen) {
    return (
      <Notice>
        <p className="jsro-effective">Not open yet</p>
        <h1 className="jsro-page-title">Online payment for {event.shortTitle} is not open yet.</h1>
        <p className="jsro-page-intro">
          Nothing is owed right now. JSRO will tell you when it opens, and how to pay the {event.fee} entry fee.
        </p>
        <p style={{ marginTop: 34 }}>
          <a className="jsro-action" href={`mailto:${site.email}?subject=${encodeURIComponent(event.title)}`}>
            Email JSRO <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />
          </a>
        </p>
      </Notice>
    );
  }

  if (paid) {
    return (
      <Notice>
        <p className="jsro-effective">Payment received</p>
        <h1 className="jsro-page-title">Thank you. Your entry fee is paid.</h1>
        <p className="jsro-page-intro">
          Your place in {event.title} is confirmed. Keep your registration code, {values.code.trim().toUpperCase()}, for submitting your project.
        </p>
        <p style={{ marginTop: 44 }}>
          <Link className="jsro-action" to={eventPath(event)}>
            Back to {event.shortTitle} <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </p>
      </Notice>
    );
  }

  const change = (e) => {
    const { name, value } = e.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => (previous[name] ? { ...previous, [name]: undefined } : previous));
  };

  const field = (name) => ({
    name,
    id: `pay-${name}`,
    value: values[name],
    onChange: change,
    disabled: busy,
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `pay-${name}-error` : undefined,
  });

  const submit = async (e) => {
    e.preventDefault();
    const found = collectErrors(values, RULES);
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirstError(found, RULES, formRef.current);
      return;
    }

    setBusy(true);
    setStatus({ tone: 'info', message: 'Opening secure checkout…' });
    const code = values.code.trim().toUpperCase();
    const email = values.email.trim();

    try {
      const result = await payForRegistration({
        code,
        email,
        description: `${event.title} entry fee`,
        onFailed: (message) => setStatus({ tone: 'error', message: `${message} You can try again in the payment window.` }),
      });

      if (result.status === 'paid') { setPaid(true); return; }
      if (result.status === 'cancelled') {
        setStatus({ tone: 'info', message: 'The payment window was closed and nothing was charged. Start again whenever you are ready.' });
      } else {
        setStatus({
          tone: 'error',
          unconfirmed: true,
          message: `We could not confirm your payment. If money left your account, do not pay again. Contact JSRO and quote ${code}.`,
        });
      }
    } catch (error) {
      setStatus({ tone: 'error', message: error.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="jsro-page">
      <SiteHeader />

      <main id="main-content" className="jsro-main register-main">
        <div className="register-intro">
          <Link className="jsro-quiet-action register-back" to={eventPath(event)}>
            Back to {event.shortTitle}
          </Link>
          <h1 className="jsro-page-title">Pay the entry fee</h1>
          <p className="jsro-page-intro">{event.title}</p>

          <dl className="register-facts">
            <div><dt>Fee</dt><dd>{event.fee}</dd></div>
            <div><dt>Pay with</dt><dd>UPI, cards, netbanking and wallets</dd></div>
            <div><dt>Secured by</dt><dd>Razorpay. JSRO never sees your card or bank details.</dd></div>
          </dl>
        </div>

        <form className="jsro-form" onSubmit={submit} ref={formRef} noValidate>
          <div className="jsro-form-row">
            <label htmlFor="pay-code">Registration code</label>
            <input {...field('code')} autoComplete="off" spellCheck="false" autoCapitalize="characters" placeholder="IC26-7K4M-Q9TX…" />
            {errors.code && <p className="jsro-field-error" id="pay-code-error">{errors.code}</p>}
          </div>

          <div className="jsro-form-row">
            <label htmlFor="pay-email">Email you registered with</label>
            <input {...field('email')} type="email" inputMode="email" autoComplete="email" spellCheck="false" autoCapitalize="none" placeholder="name@example.com…" />
            {errors.email && <p className="jsro-field-error" id="pay-email-error">{errors.email}</p>}
          </div>

          {status && (
            <p className="jsro-form-status" data-tone={status.tone === 'error' ? 'error' : undefined} role="status" aria-live="polite">
              {status.message}
              {status.unconfirmed && (
                <>
                  {' '}<a href={whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>{' '}
                  or <a href={`mailto:${site.email}`}>{site.email}</a>.
                </>
              )}
            </p>
          )}

          <div className="jsro-form-actions">
            <button className="jsro-action" type="submit" disabled={busy}>
              {busy ? 'Working…' : `Pay ${event.fee}`}
              {!busy && <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />}
            </button>
          </div>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
