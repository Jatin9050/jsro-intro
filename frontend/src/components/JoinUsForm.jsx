import { useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabase';
import { collectErrors, focusFirstError, isEmail, isUrl } from '../lib/formErrors';
import './Form.css';

const EMPTY = { name: '', email: '', phone: '', school: '', youtubeLink: '' };

const RULES = [
  { field: 'name', message: 'Add your name.' },
  { field: 'email', message: 'Add an email address.' },
  { field: 'email', message: 'That email address looks incomplete.', test: isEmail },
  { field: 'youtubeLink', message: 'Add a link to your project.' },
  { field: 'youtubeLink', message: 'Start the link with http:// or https://', test: isUrl },
];

export default function JoinUsForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

  const change = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => (previous[name] ? { ...previous, [name]: undefined } : previous));
  };

  const submit = async (event) => {
    event.preventDefault();

    const found = collectErrors(values, RULES);
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirstError(found, RULES, formRef.current);
      return;
    }

    setSaving(true);
    setStatus(null);

    const { error } = await supabase.from(TABLES.joinUs).insert([
      {
        name: values.name,
        email: values.email,
        phone: values.phone,
        school: values.school,
        youtube_link: values.youtubeLink,
      },
    ]);

    setSaving(false);

    if (error) {
      setStatus({ tone: 'error', message: `That did not send: ${error.message}. Try again, or email JSRO directly.` });
      return;
    }

    setValues(EMPTY);
    setStatus({ tone: 'success', message: 'Project received. JSRO reviews submissions and replies by email.' });
  };

  const field = (name) => ({
    name,
    id: `join-${name}`,
    value: values[name],
    onChange: change,
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `join-${name}-error` : undefined,
  });

  return (
    <form className="jsro-form" onSubmit={submit} ref={formRef} noValidate>
      <div className="jsro-form-row">
        <label htmlFor="join-name">Full name</label>
        <input {...field('name')} autoComplete="name" placeholder="Aarav Mehta…" />
        {errors.name && <p className="jsro-field-error" id="join-name-error">{errors.name}</p>}
      </div>

      <div className="jsro-form-row">
        <label htmlFor="join-email">Email</label>
        <input {...field('email')} type="email" inputMode="email" autoComplete="email" spellCheck="false" autoCapitalize="none" placeholder="name@example.com…" />
        {errors.email && <p className="jsro-field-error" id="join-email-error">{errors.email}</p>}
      </div>

      <div className="jsro-form-row">
        <label htmlFor="join-phone">Phone</label>
        <input {...field('phone')} type="tel" inputMode="tel" autoComplete="tel" spellCheck="false" placeholder="+91 98765 43210…" />
        <p className="jsro-form-hint">Optional.</p>
      </div>

      <div className="jsro-form-row">
        <label htmlFor="join-school">School, college or organisation</label>
        <input {...field('school')} autoComplete="organization" placeholder="St. Xavier's Senior Secondary…" />
        <p className="jsro-form-hint">Optional.</p>
      </div>

      <div className="jsro-form-row">
        <label htmlFor="join-youtubeLink">Link to your project</label>
        <input {...field('youtubeLink')} type="url" inputMode="url" autoComplete="url" spellCheck="false" autoCapitalize="none" placeholder="https://youtube.com/watch?v=…" />
        {errors.youtubeLink
          ? <p className="jsro-field-error" id="join-youtubeLink-error">{errors.youtubeLink}</p>
          : <p className="jsro-form-hint">A video of the thing you built says more than a description of it.</p>}
      </div>

      {status && (
        <p className="jsro-form-status" data-tone={status.tone} role="status" aria-live="polite">
          {status.message}
        </p>
      )}

      <div className="jsro-form-actions">
        <button className="jsro-action" type="submit" disabled={saving}>
          {saving ? 'Sending…' : 'Submit Your Project'}
          {!saving && <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
}
