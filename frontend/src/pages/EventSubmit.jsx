import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, FileText } from 'lucide-react';

import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { getEvent, eventPath } from '@jsro/shared/events';
import { site } from '@jsro/shared/site';
import { supabase } from '../lib/supabase';
import { collectErrors, focusFirstError, isEmail } from '../lib/formErrors';
import { checkPdf, MAX_PDF_BYTES } from '../lib/pdfCheck';
import { categories, submission } from './events/innovationChallengeContent';
import '../components/Form.css';
import './EventSubmit.css';

const CODE_SHAPE = /^[A-Z0-9]{2,6}-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/;
const between = (min, max) => (v) => v.length >= min && v.length <= max;
const atMost = (max) => (v) => v.length <= max;

const EMPTY = {
  code: '', email: '', title: '', category: '', team: '',
  problem: '', solution: '', innovation: '', technology: '',
  methodology: '', impact: '', video: '',
};

// Mirrors the CHECK constraints in project_submissions, so the visitor hears
// about a problem before a 10 MB upload rather than after it.
const RULES = [
  { field: 'code', message: 'Enter your registration code.' },
  { field: 'code', message: 'Codes look like IC26-7K4M-Q9TX. Check it against your confirmation.', test: (v) => CODE_SHAPE.test(v.toUpperCase()) },
  { field: 'email', message: 'Enter the email you registered with.' },
  { field: 'email', message: 'That email address looks incomplete.', test: isEmail },
  { field: 'title', message: 'Give the project a title of 3–160 characters.', test: between(3, 160) },
  { field: 'category', message: 'Choose the category your problem belongs to.' },
  { field: 'team', message: 'Keep the team list under 600 characters.', test: atMost(600) },
  { field: 'problem', message: 'Describe the problem in at least 20 characters (3,000 max).', test: between(20, 3000) },
  { field: 'solution', message: 'Describe your solution in at least 20 characters (3,000 max).', test: between(20, 3000) },
  { field: 'innovation', message: 'Keep this under 2,000 characters.', test: atMost(2000) },
  { field: 'technology', message: 'Keep this under 2,000 characters.', test: atMost(2000) },
  { field: 'methodology', message: 'Keep this under 2,000 characters.', test: atMost(2000) },
  { field: 'impact', message: 'Keep this under 2,000 characters.', test: atMost(2000) },
  { field: 'video', message: 'Video links must start with https://', test: (v) => v === '' || /^https:\/\/\S+$/i.test(v) },
];

function Closed({ event }) {
  return (
    <div className="jsro-page">
      <SiteHeader />
      <main id="main-content" className="jsro-main jsro-measure">
        <p className="jsro-effective">Coming soon</p>
        <h1 className="jsro-page-title">Project submissions for {event.title} are not open yet.</h1>
        <p className="jsro-page-intro">
          Submissions open after registration. Keep the registration code from your confirmation —
          you will need it, with the same email, to upload your project.
        </p>
        <p style={{ marginTop: 34 }}>
          <Link className="jsro-action" to={eventPath(event)}>
            Back to the challenge <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function EventSubmit() {
  const { slug } = useParams();
  const event = getEvent(slug);

  const [values, setValues] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [stage, setStage] = useState('idle'); // idle | checking | uploading | saving | done
  const formRef = useRef(null);
  // Focus is requested here and applied after the next render, because the
  // fields are disabled while the PDF is checked and focus() on a disabled
  // input silently does nothing.
  const [focusRequest, setFocusRequest] = useState(null);
  useEffect(() => {
    if (focusRequest) focusFirstError(focusRequest, [...RULES, { field: 'document' }], formRef.current);
  }, [focusRequest]);

  if (!event || !event.acceptsSubmissions) {
    return (
      <div className="jsro-page">
        <SiteHeader />
        <main id="main-content" className="jsro-main jsro-measure">
          <h1 className="jsro-page-title">This event does not take project submissions.</h1>
          <p style={{ marginTop: 34 }}>
            <Link className="jsro-action" to="/#events">See the events</Link>
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }
  if (!event.submissionsOpen) return <Closed event={event} />;

  const busy = stage === 'checking' || stage === 'uploading' || stage === 'saving';

  const change = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const pickFile = (e) => {
    setFile(e.target.files?.[0] || null);
    setErrors((prev) => ({ ...prev, document: undefined }));
  };

  const field = (name) => ({
    name,
    id: `submit-${name}`,
    value: values[name],
    onChange: change,
    disabled: busy,
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `submit-${name}-error` : undefined,
  });
  const err = (name) => errors[name] && (
    <p className="jsro-field-error" id={`submit-${name}-error`}>{errors[name]}</p>
  );

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const found = collectErrors(values, RULES);
    setStage('checking');
    const fileProblem = await checkPdf(file);
    if (fileProblem) found.document = fileProblem;
    setErrors(found);
    if (Object.keys(found).length) {
      setStage('idle');
      setFocusRequest({ ...found });
      return;
    }

    const code = values.code.trim().toUpperCase();
    const path = `${code}/${crypto.randomUUID()}.pdf`;

    // 1. The file. Storage independently re-checks type, size and folder.
    setStage('uploading');
    const { error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(path, file, { contentType: 'application/pdf', upsert: false });

    if (uploadError) {
      setStage('idle');
      // The bucket refuses with a policy error for a wrong code, a closed
      // window or the 3-upload cap alike, and does not say which.
      setStatus({
        tone: 'error',
        message: /size|large|413/i.test(uploadError.message)
          ? 'That PDF is over the 10 MB limit.'
          : 'The upload was refused. Check your registration code. If it is right, you may have reached the limit of 3 uploads — email JSRO.',
      });
      return;
    }

    // 2. The entry, which links the file to the registration.
    setStage('saving');
    const { error } = await supabase.rpc('submit_project', {
      p_code: code,
      p_email: values.email,
      p_title: values.title,
      p_category: values.category,
      p_team_members: values.team,
      p_problem: values.problem,
      p_solution: values.solution,
      p_innovation: values.innovation,
      p_technology: values.technology,
      p_methodology: values.methodology,
      p_impact: values.impact,
      p_document_path: path,
      p_video_url: values.video,
    });

    if (error) {
      setStage('idle');
      setStatus({
        tone: 'error',
        message: error.code === 'P0001'
          ? error.message
          : 'The submission could not be saved. Check your connection and try again, or email JSRO.',
      });
      return;
    }
    setStage('done');
  };

  if (stage === 'done') {
    return (
      <div className="jsro-page">
        <SiteHeader />
        <main id="main-content" className="jsro-main jsro-measure">
          <p className="jsro-effective">Submission received</p>
          <h1 className="jsro-page-title">Your project is in.</h1>
          <p className="jsro-page-intro">
            “{values.title}” is recorded against {values.code.trim().toUpperCase()}. Entries are scored
            after the deadline and shortlisted entrants will be contacted.
          </p>
          <div className="jsro-prose">
            <h2>Need to change something?</h2>
            <p>
              Submit again before the deadline with the same code and email. Your latest entry
              replaces the earlier one.
            </p>
          </div>
          <p style={{ marginTop: 44 }}>
            <Link className="jsro-action" to={eventPath(event)}>Back to the challenge</Link>
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const stageLabel = { checking: 'Checking your file…', uploading: 'Uploading your PDF…', saving: 'Saving your entry…' }[stage];

  return (
    <div className="jsro-page">
      <SiteHeader />

      <main id="main-content" className="jsro-main submit-main">
        <div className="submit-intro">
          <Link className="jsro-quiet-action" to={eventPath(event)}>Back to the challenge</Link>
          <h1 className="jsro-page-title">Submit your project</h1>
          <p className="jsro-page-intro">{event.title}</p>
          <p className="submit-note">{submission.note}</p>
        </div>

        <form className="jsro-form submit-form" onSubmit={submit} ref={formRef} noValidate>
          <fieldset disabled={busy}>
            <legend>Your registration</legend>
            <div className="jsro-form-row">
              <label htmlFor="submit-code">Registration code</label>
              <input {...field('code')} autoComplete="off" spellCheck="false" autoCapitalize="characters" placeholder="IC26-7K4M-Q9TX…" translate="no" />
              {err('code')}
            </div>
            <div className="jsro-form-row">
              <label htmlFor="submit-email">Email you registered with</label>
              <input {...field('email')} type="email" inputMode="email" autoComplete="email" spellCheck="false" autoCapitalize="none" placeholder="name@example.com…" />
              {err('email')}
            </div>
          </fieldset>

          <fieldset disabled={busy}>
            <legend>The project</legend>
            <div className="jsro-form-row">
              <label htmlFor="submit-title">Project title</label>
              <input {...field('title')} maxLength={160} placeholder="Smart irrigation controller…" />
              {err('title')}
            </div>
            <div className="jsro-form-row">
              <label htmlFor="submit-category">Category</label>
              <select {...field('category')}>
                <option value="">Choose a category</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
              {err('category')}
            </div>
            <div className="jsro-form-row">
              <label htmlFor="submit-team">Team members</label>
              <textarea {...field('team')} rows={2} maxLength={600} placeholder="Names and roles, if you are a team…" />
              <p className="jsro-form-hint">Optional. Leave blank if you are entering alone.</p>
              {err('team')}
            </div>
            <div className="jsro-form-row">
              <label htmlFor="submit-problem">Problem statement</label>
              <textarea {...field('problem')} rows={4} maxLength={3000} placeholder="What real-world problem are you solving, and for whom?…" />
              {err('problem')}
            </div>
            <div className="jsro-form-row">
              <label htmlFor="submit-solution">Proposed solution</label>
              <textarea {...field('solution')} rows={4} maxLength={3000} placeholder="What did you build or design, and how does it solve the problem?…" />
              {err('solution')}
            </div>
          </fieldset>

          <fieldset disabled={busy}>
            <legend>Detail for the judges</legend>
            <p className="jsro-form-hint fieldset-hint">All optional, but each one maps to a judging criterion.</p>
            <div className="jsro-form-row">
              <label htmlFor="submit-innovation">What makes it original</label>
              <textarea {...field('innovation')} rows={3} maxLength={2000} />
              {err('innovation')}
            </div>
            <div className="jsro-form-row">
              <label htmlFor="submit-technology">Technology and components</label>
              <textarea {...field('technology')} rows={3} maxLength={2000} placeholder="ESP32, capacitive soil sensor, solenoid valve…" />
              {err('technology')}
            </div>
            <div className="jsro-form-row">
              <label htmlFor="submit-methodology">Working principle or method</label>
              <textarea {...field('methodology')} rows={3} maxLength={2000} />
              {err('methodology')}
            </div>
            <div className="jsro-form-row">
              <label htmlFor="submit-impact">Expected impact</label>
              <textarea {...field('impact')} rows={3} maxLength={2000} />
              {err('impact')}
            </div>
          </fieldset>

          <fieldset disabled={busy}>
            <legend>Your files</legend>
            <div className="jsro-form-row">
              <label htmlFor="submit-document">Project document (PDF)</label>
              <input
                id="submit-document"
                name="document"
                type="file"
                accept="application/pdf,.pdf"
                onChange={pickFile}
                aria-invalid={errors.document ? 'true' : undefined}
                aria-describedby={errors.document ? 'submit-document-error' : 'submit-document-hint'}
              />
              {file && !errors.document && (
                <p className="file-chosen"><FileText size={16} aria-hidden="true" /> {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</p>
              )}
              <p className="jsro-form-hint" id="submit-document-hint">
                2–5 pages, up to {MAX_PDF_BYTES / 1024 / 1024} MB. Include photos, CAD, circuit diagrams or simulation screenshots inside it.
              </p>
              {errors.document && <p className="jsro-field-error" id="submit-document-error">{errors.document}</p>}
            </div>
            <div className="jsro-form-row">
              <label htmlFor="submit-video">Demo or pitch video link</label>
              <input {...field('video')} type="url" inputMode="url" autoComplete="url" spellCheck="false" autoCapitalize="none" placeholder="https://youtube.com/watch?v=…" />
              <p className="jsro-form-hint">Optional. 3–5 minutes, on YouTube or Google Drive.</p>
              {err('video')}
            </div>
          </fieldset>

          {status && (
            <p className="jsro-form-status" data-tone={status.tone} role="alert">{status.message}</p>
          )}

          <div className="jsro-form-actions">
            <button className="jsro-action" type="submit" disabled={busy}>
              {busy ? stageLabel : 'Submit project'}
            </button>
            <span className="sr-only" role="status" aria-live="polite">{busy ? stageLabel : ''}</span>
          </div>
          <p className="jsro-form-hint">
            Problems? Email <a href={`mailto:${site.email}`}>{site.email}</a> with your registration code.
          </p>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
