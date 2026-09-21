import { useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabase';
import { collectErrors, focusFirstError, isEmail } from '../lib/formErrors';
import './Form.css';

const EMPTY = { schoolName: '', contactNo: '', schoolEmail: '' };

const RULES = [
  { field: 'schoolName', message: 'Tell us where the workshop should run.' },
  { field: 'contactNo', message: 'Add a number JSRO can call.' },
  { field: 'schoolEmail', message: 'Add an email address.' },
  { field: 'schoolEmail', message: 'That email address looks incomplete.', test: isEmail },
];

export default function WorkshopForm() {
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

    const { error } = await supabase.from(TABLES.workshopBookings).insert([
      {
        school_name: values.schoolName,
        contact_no: values.contactNo,
        school_email: values.schoolEmail,
      },
    ]);

    setSaving(false);

    if (error) {
      setStatus({ tone: 'error', message: `That did not send: ${error.message}. Try again, or email JSRO directly.` });
      return;
    }

    setValues(EMPTY);
    setStatus({ tone: 'success', message: 'Request received. JSRO will be in touch about dates and format.' });
  };

  const field = (name) => ({
    name,
    id: `workshop-${name}`,
    value: values[name],
    onChange: change,
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `workshop-${name}-error` : undefined,
  });

  return (
    <form className="jsro-form" onSubmit={submit} ref={formRef} noValidate>
      <div className="jsro-form-row">
        <label htmlFor="workshop-schoolName">School, college or organisation</label>
        <input {...field('schoolName')} autoComplete="organization" placeholder="St. Xavier's Senior Secondary…" />
        {errors.schoolName && <p className="jsro-field-error" id="workshop-schoolName-error">{errors.schoolName}</p>}
      </div>

      <div className="jsro-form-row">
        <label htmlFor="workshop-contactNo">Contact number</label>
        <input {...field('contactNo')} type="tel" inputMode="tel" autoComplete="tel" spellCheck="false" placeholder="+91 98765 43210" />
        {errors.contactNo && <p className="jsro-field-error" id="workshop-contactNo-error">{errors.contactNo}</p>}
      </div>

      <div className="jsro-form-row">
        <label htmlFor="workshop-schoolEmail">Email</label>
        <input {...field('schoolEmail')} type="email" inputMode="email" autoComplete="email" spellCheck="false" autoCapitalize="none" placeholder="name@institution.edu…" />
        {errors.schoolEmail && <p className="jsro-field-error" id="workshop-schoolEmail-error">{errors.schoolEmail}</p>}
      </div>

      {status && (
        <p className="jsro-form-status" data-tone={status.tone} role="status" aria-live="polite">
          {status.message}
        </p>
      )}

      <div className="jsro-form-actions">
        <button className="jsro-action" type="submit" disabled={saving}>
          {saving ? 'Sending…' : 'Request a Workshop'}
          {!saving && <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
}
