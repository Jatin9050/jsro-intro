import { PGlite } from '@electric-sql/pglite';

import fs from 'node:fs';
import path from 'node:path';

const MIG = new URL('../migrations', import.meta.url).pathname;
const db = new PGlite();

let pass = 0, fail = 0;
const ok  = (name) => { pass++; console.log('  PASS  ' + name); };
const bad = (name, why) => { fail++; console.log('  FAIL  ' + name + '\n        ' + why); };

// Run SQL as a role, optionally as a signed-in user. Always restores the role.
async function as(role, sub, sql, params = []) {
  await db.exec(`set role ${role}`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [sub || '']);
  try { return await db.query(sql, params); }
  finally { await db.exec('reset role'); await db.query(`select set_config('request.jwt.claim.sub','',false)`); }
}
async function expectErr(name, fn, match) {
  try { await fn(); bad(name, 'expected an error, got success'); }
  catch (e) {
    if (!match || new RegExp(match, 'i').test(e.message)) ok(name + '  ->  ' + e.message.slice(0, 70));
    else bad(name, 'wrong error: ' + e.message);
  }
}
async function expectOk(name, fn, check) {
  try { const r = await fn(); if (check && !check(r)) bad(name, 'unexpected result: ' + JSON.stringify(r.rows ?? r).slice(0, 140)); else { ok(name); return r; } }
  catch (e) { bad(name, e.message); }
}

console.log('\n== 1. apply environment + every migration in order ==');
await db.exec(fs.readFileSync(new URL('./supabase_stub.sql', import.meta.url), 'utf8'));
const files = fs.readdirSync(MIG).filter(f => f.endsWith('.sql')).sort();
// HARNESS-ONLY substitution. This PGlite build cannot load pgcrypto (missing
// OpenSSL symbol), so stand in gen_random_bytes with core Postgres'
// gen_random_uuid(), which is also CSPRNG-backed. Production keeps the real
// extension; the migration file itself is not modified.
await db.exec(`
  create function extensions.gen_random_bytes(n int) returns bytea language sql volatile as $$
    select substring(decode(string_agg(replace(gen_random_uuid()::text,'-',''), ''), 'hex') from 1 for n)
    from generate_series(1, ceil(n / 16.0)::int)
  $$;`);
const PGCRYPTO = /create extension if not exists pgcrypto with schema extensions;/;
for (const f of files) {
  try {
    let sql = fs.readFileSync(path.join(MIG, f), 'utf8');
    if (PGCRYPTO.test(sql)) sql = sql.replace(PGCRYPTO, '-- (harness: pgcrypto stood in above)');
    await db.exec(sql); ok('applied ' + f);
  }
  catch (e) { bad('applied ' + f, e.message); console.log('\nABORT: migration chain broken'); process.exit(1); }
}

const sohan = await db.query(`select count(*)::int n from public.event_registrations where name='Sohan Anjaan'`);
sohan.rows[0].n === 1 ? ok('legacy registration survived every migration') : bad('legacy data', 'Sohan row lost');

console.log('\n== 2. the hole this review found: authenticated read ==');
const stranger = (await db.query(`insert into auth.users (email, email_confirmed_at) values ('stranger@example.com', now()) returning id`)).rows[0].id;
const admin    = (await db.query(`insert into auth.users (email, email_confirmed_at) values ('info@jsro.in', now()) returning id`)).rows[0].id;
const imposter = (await db.query(`insert into auth.users (email, email_confirmed_at) values ('INFO@jsro.in', null) returning id`)).rows[0].id;

await expectOk('stranger who signed up sees 0 registrations', () => as('authenticated', stranger, 'select * from public.event_registrations'), r => r.rows.length === 0);
await expectOk('unconfirmed account using the admin email sees 0', () => as('authenticated', imposter, 'select * from public.event_registrations'), r => r.rows.length === 0);
await expectOk('confirmed admin sees the registrations', () => as('authenticated', admin, 'select * from public.event_registrations'), r => r.rows.length >= 1);
// Supabase's default privileges grant anon EXECUTE on every new public
// function; `revoke ... from public` does not undo that explicit grant.
await expectOk('anon has no EXECUTE on is_admin()', () => db.query(`select has_function_privilege('anon','public.is_admin()','execute') v`), r => r.rows[0].v === false);
await expectOk('is_admin() false for stranger', () => as('authenticated', stranger, 'select public.is_admin() a'), r => r.rows[0].a === false);
await expectOk('is_admin() true for admin', () => as('authenticated', admin, 'select public.is_admin() a'), r => r.rows[0].a === true);
await expectErr('anon cannot read the admin allow-list', () => as('anon', null, 'select * from public.admins'), 'permission denied');
await expectErr('authenticated cannot read the admin allow-list', () => as('authenticated', stranger, 'select * from public.admins'), 'permission denied');
await expectErr('stranger cannot forge payment=true', () => as('authenticated', stranger, `insert into public.event_registrations (name,email,phone,school,event,payment) values ('x','a@b.co','1234567','s','e',true)`), 'permission denied');

console.log('\n== 3. anon baseline still holds ==');
await expectErr('anon has no read privilege on registrations', () => as('anon', null, 'select * from public.event_registrations'), 'permission denied');
await expectErr('anon cannot insert registrations directly anymore', () => as('anon', null, `insert into public.event_registrations (name,email,phone,school,event) values ('x','a@b.co','1234567','s','e')`), 'permission denied');
await expectErr('anon cannot forge paid=true on a booking', () => as('anon', null, `insert into public.workshop_bookings (school_name,contact_no,school_email,paid) values ('S','123','a@b.co',true)`), 'permission denied');
await expectOk('anon can still book a workshop', () => as('anon', null, `insert into public.workshop_bookings (school_name,contact_no,school_email) values ('Real School','9999999999','a@b.co')`));
await expectOk('signed-in admin can still use the public workshop form', () => as('authenticated', admin, `insert into public.workshop_bookings (school_name,contact_no,school_email) values ('Admin Test','9999999999','a@b.co')`));

console.log('\n== 4. registration: closed by default ==');
const reg = (slug, n, e, p, s) => as('anon', null, 'select public.register_participant($1,$2,$3,$4,$5) code', [slug, n, e, p, s]);
await expectErr('closed event refuses registration', () => reg('innovation-challenge', 'Aarav Mehta', 'aarav@example.com', '9876543210', 'DPS'), 'not open yet');
await expectErr('unknown event refuses', () => reg('nope', 'Aarav Mehta', 'aarav@example.com', '9876543210', 'DPS'), 'does not exist');

await db.exec(`update public.event_settings set registration_open = true where slug = 'innovation-challenge'`);
console.log('   (opened innovation-challenge for the remaining tests)');

console.log('\n== 5. registration codes ==');
const r1 = await expectOk('valid registration returns a code', () => reg('innovation-challenge', 'Aarav Mehta', 'Aarav@Example.com', '+91 98765 43210', 'DPS Hisar'));
const code = r1?.rows[0].code;
console.log('   code = ' + code);
/^IC26-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/.test(code) ? ok('format IC26-XXXX-XXXX') : bad('format', code);
/[01OIL]/.test(code.slice(5)) ? bad('ambiguous symbols', code) : ok('no 0/O/1/I/L in the code');

const many = new Set();
for (let i = 0; i < 300; i++) many.add((await db.query(`select private.generate_registration_code('IC26') c`)).rows[0].c);
many.size === 300 ? ok('300 generated codes, 300 unique') : bad('uniqueness', `${many.size}/300`);

await expectErr('same email again (different case) is refused', () => reg('innovation-challenge', 'Someone', 'AARAV@example.com', '9876543210', 'X School'), 'already registered');
const dupLeak = await db.query(`select count(*)::int n from public.event_registrations where lower(email)='aarav@example.com'`);
dupLeak.rows[0].n === 1 ? ok('duplicate created no second row') : bad('dup', 'second row exists');
await expectErr('bad email refused',   () => reg('innovation-challenge', 'Aarav Mehta', 'not-an-email', '9876543210', 'DPS'), 'valid email');
await expectErr('one-letter name refused', () => reg('innovation-challenge', 'A', 'z@example.com', '9876543210', 'DPS'), 'full name');
await expectErr('letters in phone refused', () => reg('innovation-challenge', 'Aarav M', 'z@example.com', 'call me', 'DPS'), 'phone');
await expectErr('anon cannot call the private code generator', () => as('anon', null, `select private.generate_registration_code('IC26')`), 'permission denied');

const stored = (await db.query(`select email, event, event_slug, payment from public.event_registrations where registration_code=$1`, [code])).rows[0];
stored.email === 'aarav@example.com' ? ok('email stored lower-cased') : bad('email case', stored.email);
stored.event === 'JSRO Innovation Challenge 2026' && stored.event_slug === 'innovation-challenge' ? ok('event title + slug recorded') : bad('event', JSON.stringify(stored));
stored.payment === false || stored.payment === null ? ok('payment never set by the caller') : bad('payment', String(stored.payment));

console.log('\n== 6. uploads (storage RLS) ==');
const up = (name) => as('anon', null, `insert into storage.objects (bucket_id, name) values ('submissions', $1)`, [name]);
await expectErr('upload refused while submissions are closed', () => up(`${code}/a.pdf`), 'row-level security');
await db.exec(`update public.event_settings set submissions_open = true where slug = 'innovation-challenge'`);
console.log('   (opened submissions)');
await expectOk('PDF into own folder accepted', () => up(`${code}/doc1.pdf`));
await expectErr('.exe refused', () => up(`${code}/payload.exe`), 'row-level security');
await expectErr('.pdf.exe refused', () => up(`${code}/x.pdf.exe`), 'row-level security');
await expectErr('made-up code folder refused', () => up(`IC26-AAAA-BBBB/x.pdf`), 'row-level security');
await expectErr('root of bucket refused', () => up(`x.pdf`), 'row-level security');
await expectOk('2nd file accepted', () => up(`${code}/doc2.pdf`));
await expectOk('3rd file accepted', () => up(`${code}/doc3.pdf`));
await expectErr('4th file refused (storage-flood cap)', () => up(`${code}/doc4.pdf`), 'row-level security');
// Found against production: a single multi-row insert (and, through the API,
// parallel uploads) slipped past the 3-file cap because the count ran on a
// snapshot taken before the statement's own rows existed.
const second = (await reg('innovation-challenge', 'Burst Tester', 'burst@example.com', '9123456780', 'KV Hisar')).rows[0].code;
await expectErr('4 files in ONE statement refused (cap holds within a statement)', () => as('anon', null,
  `insert into storage.objects (bucket_id, name) select 'submissions', $1 || '/' || g || '.pdf' from generate_series(1, 4) g`, [second]), 'row-level security');
await expectOk('...and none of the 4 were stored', () => db.query(`select count(*)::int n from storage.objects where name like $1`, [second + '/%']), r => r.rows[0].n === 0);
await expectOk('anon cannot list anyone\'s files', () => as('anon', null, `select * from storage.objects where bucket_id='submissions'`), r => r.rows.length === 0);
await expectOk('anon delete affects 0 files', () => as('anon', null, `delete from storage.objects where bucket_id='submissions' returning id`), r => r.rows.length === 0);
await expectOk('anon overwrite affects 0 files', () => as('anon', null, `update storage.objects set name='hijack.pdf' where bucket_id='submissions' returning id`), r => r.rows.length === 0);
await expectOk('admin can see uploaded files', () => as('authenticated', admin, `select * from storage.objects where bucket_id='submissions'`), r => r.rows.length === 3);
const b = (await db.query(`select public, file_size_limit, allowed_mime_types from storage.buckets where id='submissions'`)).rows[0];
b.public === false && Number(b.file_size_limit) === 10485760 && b.allowed_mime_types.join() === 'application/pdf' ? ok('bucket private, 10 MB, PDF only') : bad('bucket', JSON.stringify(b));

console.log('\n== 7. submitting a project ==');
const other = (await reg('innovation-challenge', 'Riya Kapoor', 'riya@example.com', '9123456789', 'KV')).rows[0].code;
await up(`${other}/riya.pdf`);
const sub = (c, e, p, v = null, category = 'sustainability') => as('anon', null,
  `select public.submit_project($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) id`,
  [c, e, 'Smart Irrigation Controller', category, 'Aarav, Riya',
   'Farmers over-water because they cannot see soil moisture in real time.',
   'An ESP32 node reads soil moisture and opens a valve only when needed.',
   null, 'ESP32, capacitive sensor', null, null, p, v]);

const e1 = await sub(code, 'wrong@example.com', `${code}/doc1.pdf`).catch(x => x.message);
const e2 = await sub('IC26-ZZZZ-ZZZZ', 'aarav@example.com', `${code}/doc1.pdf`).catch(x => x.message);
e1 === e2 && /do not match/.test(e1) ? ok('wrong email and wrong code give the identical error (no oracle)') : bad('oracle', `"${e1}" vs "${e2}"`);
await expectErr('cannot attach another entrant\'s file', () => sub(code, 'aarav@example.com', `${other}/riya.pdf`), 'upload your project');
await expectErr('path traversal refused', () => sub(code, 'aarav@example.com', `${code}/../${other}/riya.pdf`), 'upload your project');
await expectErr('a path that was never uploaded is refused', () => sub(code, 'aarav@example.com', `${code}/ghost.pdf`), 'upload your project');
await expectErr('javascript: video link refused', () => sub(code, 'aarav@example.com', `${code}/doc1.pdf`, 'javascript:alert(1)'), 'https');
const s1 = await expectOk('valid submission accepted', () => sub(code, ' AARAV@example.com ', `${code}/doc1.pdf`, 'https://youtu.be/abc'));
const id1 = s1?.rows[0].id;
await new Promise(r => setTimeout(r, 30));
const s2 = await expectOk('resubmission accepted', () => sub(code.toLowerCase(), 'aarav@example.com', `${code}/doc2.pdf`));
s2?.rows[0].id === id1 ? ok('resubmission replaces the entry, same id') : bad('upsert', 'new row created');
// The poster's five tracks, enforced by the database.
for (const track of ['robotics-ai', 'sustainability', 'space-aerospace', 'social-impact', 'open-innovation']) {
  await expectOk(`track "${track}" is accepted`, () => sub(code, 'aarav@example.com', `${code}/doc2.pdf`, null, track));
}
for (const old of ['iot-smart-systems', 'robotics-automation', 'smart-city', 'made-up', '']) {
  await expectErr(`track "${old}" is refused (not one of the five)`, () => sub(code, 'aarav@example.com', `${code}/doc2.pdf`, null, old), 'check constraint|category');
}
await expectOk('...and the entry kept its last valid track', () => db.query(`select category from public.project_submissions where id = $1`, [id1]), (r) => r.rows[0].category === 'open-innovation');
await sub(code, 'aarav@example.com', `${code}/doc2.pdf`, null, 'sustainability');
const cnt = (await db.query(`select count(*)::int n, max(document_path) p from public.project_submissions`)).rows[0];
cnt.n === 1 && cnt.p.endsWith('doc2.pdf') ? ok('one row, latest document kept') : bad('rows', JSON.stringify(cnt));
await expectErr('anon has no read privilege on submissions', () => as('anon', null, 'select * from public.project_submissions'), 'permission denied');
await expectOk('stranger reads 0 submissions', () => as('authenticated', stranger, 'select * from public.project_submissions'), r => r.rows.length === 0);
await expectOk('admin reads the submission', () => as('authenticated', admin, 'select * from public.project_submissions'), r => r.rows.length === 1);
await expectErr('anon cannot write submissions directly', () => as('anon', null, `insert into public.project_submissions (registration_id, project_title, category, problem_statement, proposed_solution, document_path) values (gen_random_uuid(),'x','smart-city','xxxxxxxxxxxxxxxxxxxxxx','xxxxxxxxxxxxxxxxxxxxxx','a.pdf')`), 'permission denied');

console.log('\n== 12. registration deadline ==');
// Called without switching role: the logic is what is under test here (the
// role-level privileges of these functions are covered in the sections above).
const startPaidNow = (slug, n, e) => db.query(`select * from public.start_paid_registration($1, $2, $3, '9123456789', 'DPS Hisar')`, [slug, n, e]);
await expectOk('the Innovation Challenge closes at the end of 22 Nov 2026, India time', () => db.query(
  `select registration_closes_at = '2026-11-22 18:30:00+00'::timestamptz as ok from public.event_settings where slug = 'innovation-challenge'`), (r) => r.rows[0].ok === true);

await db.exec(`update public.event_settings set registration_open = true, fee_paise = 10000, registration_closes_at = now() - interval '1 minute' where slug = 'innovation-challenge'`);
await expectErr('after the deadline the paid route refuses', () => startPaidNow('innovation-challenge', 'Late Person', 'late-one@deadline.test'), 'has closed');
await expectErr('after the deadline the free route refuses too', () => reg('innovation-challenge', 'Late Person', 'late-two@deadline.test', '9123456789', 'DPS Hisar'), 'has closed');
await expectOk('...and neither created anything', () => db.query(`select count(*)::int n from public.event_registrations where email like '%@deadline.test'`), (r) => r.rows[0].n === 0);

await db.exec(`update public.event_settings set registration_closes_at = now() + interval '1 hour' where slug = 'innovation-challenge'`);
await expectOk('before the deadline the paid route works', () => startPaidNow('innovation-challenge', 'On Time', 'ontime@deadline.test'), (r) => r.rows.length === 1);

await db.exec(`update public.event_settings set registration_closes_at = null where slug = 'innovation-challenge'`);
await expectOk('with no deadline set it stays open', () => startPaidNow('innovation-challenge', 'No Deadline', 'nodeadline@deadline.test'), (r) => r.rows.length === 1);

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==\n`);
process.exit(fail ? 1 : 0);
