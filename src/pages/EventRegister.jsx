import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { getEvent, eventPath } from '../data/events';
import { supabase, TABLES } from '../lib/supabase';
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

export default function EventRegister() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const event = getEvent(slug);

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

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

    const { error } = await supabase.from(TABLES.eventRegistrations).insert([
      {
        name: values.name,
        email: values.email,
        phone: values.phone,
        school: values.school,
        event: event.title,
      },
    ]);

    setSaving(false);

    if (error) {
      setStatus({ tone: 'error', message: `That did not send: ${error.message}. Try again, or email JSRO directly.` });
      return;
    }

    navigate('/thank-you', { state: { eventSlug: event.slug, name: values.name } });
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

          <div className="jsro-form-actions">
            <button className="jsro-action" type="submit" disabled={saving}>
              {saving ? 'Sending…' : 'Confirm Registration'}
              {!saving && <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />}
            </button>
          </div>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
