import { useCallback, useEffect, useState } from 'react';
import { Download, ExternalLink, FileText, LogOut } from 'lucide-react';

import { supabase } from '../lib/supabase';
import { downloadCsv, safeHttps, toCsv } from '../lib/csv';
import { categories } from './events/innovationChallengeContent';
import '../components/Form.css';
import './Admin.css';

/*
 * JSRO admin. Not linked from anywhere and excluded from indexing.
 *
 * The `isAdmin` check below only decides what to SHOW. It is not what protects
 * the data: every query is filtered by row level security in Postgres, which
 * returns nothing to a signed-in user who is not on the admin allow-list —
 * however this page is modified.
 */

const categoryName = (slug) => categories.find((c) => c.slug === slug)?.name || slug;
const when = (iso) => (iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');

const TABS = [
  {
    id: 'registrations', label: 'Registrations',
    load: () => supabase.from('event_registrations')
      .select('id, created_at, registration_code, event, event_slug, name, email, phone, school')
      .order('created_at', { ascending: false }),
    columns: [
      { label: 'Registered', get: (r) => when(r.created_at) },
      { label: 'Code', get: (r) => r.registration_code || '—' },
      { label: 'Event', get: (r) => r.event },
      { label: 'Name', get: (r) => r.name },
      { label: 'Email', get: (r) => r.email },
      { label: 'Phone', get: (r) => r.phone },
      { label: 'School / organisation', get: (r) => r.school },
    ],
  },
  {
    id: 'submissions', label: 'Project submissions',
    load: () => supabase.from('project_submissions')
      .select('*, event_registrations(name, email, registration_code)')
      .order('submitted_at', { ascending: false }),
    columns: [
      { label: 'Submitted', get: (r) => when(r.updated_at || r.submitted_at) },
      { label: 'Code', get: (r) => r.event_registrations?.registration_code },
      { label: 'Entrant', get: (r) => r.event_registrations?.name },
      { label: 'Email', get: (r) => r.event_registrations?.email },
      { label: 'Title', get: (r) => r.project_title },
      { label: 'Category', get: (r) => categoryName(r.category) },
      { label: 'Team', get: (r) => r.team_members },
      { label: 'Problem', get: (r) => r.problem_statement },
      { label: 'Solution', get: (r) => r.proposed_solution },
      { label: 'Originality', get: (r) => r.innovation },
      { label: 'Technology', get: (r) => r.technology },
      { label: 'Method', get: (r) => r.methodology },
      { label: 'Impact', get: (r) => r.expected_impact },
      { label: 'Video', get: (r) => r.video_url, link: true },
      { label: 'Document', get: (r) => r.document_path, file: true },
    ],
  },
  {
    id: 'workshops', label: 'Workshop requests',
    load: () => supabase.from('workshop_bookings')
      .select('id, created_at, school_name, contact_no, school_email')
      .order('created_at', { ascending: false }),
    columns: [
      { label: 'Requested', get: (r) => when(r.created_at) },
      { label: 'Institution', get: (r) => r.school_name },
      { label: 'Contact', get: (r) => r.contact_no },
      { label: 'Email', get: (r) => r.school_email },
    ],
  },
  {
    id: 'joinus', label: 'Join-us projects',
    load: () => supabase.from('join_us_submissions')
      .select('id, created_at, name, email, phone, school, youtube_link')
      .order('created_at', { ascending: false }),
    columns: [
      { label: 'Sent', get: (r) => when(r.created_at) },
      { label: 'Name', get: (r) => r.name },
      { label: 'Email', get: (r) => r.email },
      { label: 'Phone', get: (r) => r.phone },
      { label: 'School', get: (r) => r.school },
      { label: 'Project link', get: (r) => r.youtube_link, link: true },
    ],
  },
];

function SignIn({ onSignedIn, notice }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  // `notice` comes from the parent and can change while this form stays
  // mounted (e.g. a non-admin is signed straight back out), so read it live.
  const shown = error || notice;
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Enter your admin email and password.'); return; }
    setBusy(true); setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    // Deliberately one message for every failure, so this form cannot be used
    // to discover which addresses have accounts.
    if (authError) { setError('Those details did not work.'); return; }
    onSignedIn();
  };

  return (
    <main id="main-content" className="admin-signin">
      <h1>JSRO admin</h1>
      <form className="jsro-form" onSubmit={submit} noValidate>
        <div className="jsro-form-row">
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" type="email" autoComplete="username" spellCheck="false" autoCapitalize="none"
            value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} />
        </div>
        <div className="jsro-form-row">
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" type="password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy} />
        </div>
        {shown && <p className="jsro-form-status" data-tone="error" role="alert">{shown}</p>}
        <div className="jsro-form-actions">
          <button className="jsro-action" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </div>
      </form>
    </main>
  );
}

function DataTable({ tab, rows, onOpenFile }) {
  if (!rows.length) return <p className="admin-empty">Nothing here yet.</p>;
  return (
    <div className="admin-table-wrap" role="region" aria-label={`${tab.label} table`} tabIndex={0}>
      <table className="admin-table">
        <thead>
          <tr>{tab.columns.map((c) => <th key={c.label} scope="col">{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {tab.columns.map((c) => {
                const value = c.get(row);
                if (c.file) {
                  return (
                    <td key={c.label}>
                      {value
                        ? <button type="button" className="admin-file" onClick={() => onOpenFile(value)}><FileText size={15} aria-hidden="true" /> Open PDF</button>
                        : '—'}
                    </td>
                  );
                }
                if (c.link) {
                  const href = safeHttps(value);
                  return (
                    <td key={c.label}>
                      {href
                        ? <a href={href} target="_blank" rel="noopener noreferrer nofollow">Open <ExternalLink size={13} aria-hidden="true" /></a>
                        // Anything that is not plain https is shown as inert text, never a link.
                        : <span className="admin-inert">{value || '—'}</span>}
                    </td>
                  );
                }
                return <td key={c.label}>{value ?? '—'}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Admin() {
  const [phase, setPhase] = useState('loading'); // loading | signin | denied | ready
  const [notice, setNotice] = useState(null);
  const [active, setActive] = useState(TABS[0].id);
  const [data, setData] = useState({});
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const meta = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex, nofollow' });
    document.head.appendChild(meta);
    const previousTitle = document.title;
    document.title = 'Admin · JSRO';
    return () => { meta.remove(); document.title = previousTitle; };
  }, []);

  const verify = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setPhase('signin'); return; }
    const { data: isAdmin, error } = await supabase.rpc('is_admin');
    if (error || isAdmin !== true) {
      await supabase.auth.signOut();
      setNotice('That account does not have admin access.');
      setPhase('signin');
      return;
    }
    setPhase('ready');
  }, []);

  useEffect(() => { verify(); }, [verify]);

  const tab = TABS.find((t) => t.id === active);

  useEffect(() => {
    if (phase !== 'ready' || data[active]) return;
    let cancelled = false;
    tab.load().then(({ data: rows, error }) => {
      if (cancelled) return;
      if (error) { setLoadError(`Could not load ${tab.label.toLowerCase()}.`); return; }
      setLoadError(null);
      setData((prev) => ({ ...prev, [active]: rows || [] }));
    });
    return () => { cancelled = true; };
  }, [phase, active, data, tab]);

  const openFile = async (path) => {
    // Short-lived signed URL: the bucket is private and the link expires in a minute.
    const { data: signed, error } = await supabase.storage.from('submissions').createSignedUrl(path, 60);
    if (error || !signed?.signedUrl) { setLoadError('Could not open that document.'); return; }
    window.open(signed.signedUrl, '_blank', 'noopener,noreferrer');
  };

  const exportCsv = () => {
    const rows = data[active] || [];
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`jsro-${active}-${stamp}.csv`, toCsv(rows, tab.columns));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setData({}); setNotice(null); setPhase('signin');
  };

  if (phase === 'loading') return <div className="jsro-page admin"><p className="admin-empty">Loading…</p></div>;
  if (phase === 'signin') return <div className="jsro-page admin"><SignIn notice={notice} onSignedIn={() => { setNotice(null); verify(); }} /></div>;

  const rows = data[active];

  return (
    <div className="jsro-page admin">
      <header className="admin-bar">
        <span className="admin-brand">JSRO admin</span>
        <button type="button" className="jsro-quiet-action admin-signout" onClick={signOut}>
          <LogOut size={16} aria-hidden="true" /> Sign out
        </button>
      </header>

      <main id="main-content" className="admin-main">
        <div className="admin-tabs" role="tablist" aria-label="Data sets">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" id={`tab-${t.id}`}
              aria-selected={active === t.id} aria-controls="admin-panel"
              className="admin-tab" onClick={() => setActive(t.id)}>
              {t.label}
              {data[t.id] && <span className="admin-count">{data[t.id].length}</span>}
            </button>
          ))}
        </div>

        <section id="admin-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="admin-panel">
          <div className="admin-panel-head">
            <h1>{tab.label}</h1>
            <button type="button" className="jsro-action" onClick={exportCsv} disabled={!rows?.length}>
              Export CSV <Download size={17} aria-hidden="true" />
            </button>
          </div>
          {loadError && <p className="jsro-form-status" data-tone="error" role="alert">{loadError}</p>}
          {rows ? <DataTable tab={tab} rows={rows} onOpenFile={openFile} /> : <p className="admin-empty">Loading…</p>}
        </section>
      </main>
    </div>
  );
}
