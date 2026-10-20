import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Check, Copy } from 'lucide-react';

import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { getEvent, submitPath } from '@jsro/shared/events';
import { site, whatsappUrl } from '@jsro/shared/site';
import './ThankYou.css';

// Accept only the shape the database produces, so nothing arbitrary from
// navigation state is ever rendered as a "registration code".
const CODE_SHAPE = /^[A-Z0-9]{2,6}-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/;

export default function ThankYou() {
  const { state } = useLocation();
  const event = state?.eventSlug ? getEvent(state.eventSlug) : null;
  const firstName = state?.name ? state.name.trim().split(' ')[0] : null;
  const code = typeof state?.code === 'string' && CODE_SHAPE.test(state.code) ? state.code : null;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="jsro-page">
      <SiteHeader />

      <main id="main-content" className="jsro-main jsro-measure">
        <p className="jsro-effective">{state?.paid ? 'Registration and payment received' : 'Registration received'}</p>
        <h1 className="jsro-page-title">
          {firstName ? `You’re registered, ${firstName}.` : 'You are registered.'}
        </h1>
        <p className="jsro-page-intro">
          {event ? `Your place in ${event.title} is recorded.` : 'Your registration is recorded.'}
        </p>

        {code && (
          <section className="reg-code" aria-labelledby="reg-code-label">
            <p id="reg-code-label" className="reg-code-label">Your registration code</p>
            <p className="reg-code-value" translate="no">{code}</p>
            <div className="reg-code-actions">
              <button type="button" className="jsro-action" onClick={copy}>
                {copied ? 'Copied' : 'Copy code'}
                {copied
                  ? <Check size={18} strokeWidth={2} aria-hidden="true" />
                  : <Copy size={18} strokeWidth={1.8} aria-hidden="true" />}
              </button>
              <span className="reg-code-live" role="status" aria-live="polite">
                {copied ? 'Registration code copied to the clipboard.' : ''}
              </span>
            </div>
            <p className="reg-code-note">
              Keep this code. You will need it, together with the same email address, to
              submit your project. JSRO cannot show it to you again on this page.
            </p>
          </section>
        )}

        <div className="jsro-prose">
          {event?.acceptsSubmissions && (
            <>
              <h2>What happens next</h2>
              <p>
                {event.submissionsOpen ? 'Submissions are open. Upload' : 'When submissions open, upload'} your project from the{' '}
                <Link to={submitPath(event)}>submission page</Link> using your code and email.
              </p>
            </>
          )}

          <h2>About payment</h2>
          {state?.paid ? (
            <p>
              Your {event?.fee ? `${event.fee} ` : ''}entry fee is paid. Razorpay emails you a receipt
              {typeof state.paymentId === 'string' && /^pay_[A-Za-z0-9]+$/.test(state.paymentId) ? ` (payment ID ${state.paymentId})` : ''}.
              If you lose your code, use “Already paid? Get your code” on the registration page with that payment ID.
            </p>
          ) : (
            <p>
              Online payment is not live on this site yet, so nothing is owed right now. JSRO
              will tell you the fee and how to pay it when your place is confirmed.
            </p>
          )}

          <h2>If you need JSRO</h2>
          <p>
            Message the team on{' '}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>{' '}
            or email <a href={`mailto:${site.email}`}>{site.email}</a>.
            {code && ' Quote your registration code.'}
          </p>
        </div>

        <p style={{ marginTop: 44 }}>
          <Link className="jsro-action" to="/#events">
            Back to the events <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
