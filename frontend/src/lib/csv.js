/*
 * CSV export that is safe to open in Excel or Sheets.
 *
 * Every field comes from a public form, so any cell can be attacker-written.
 * A cell beginning with = + - @ (or a tab / carriage return) is treated as a
 * formula by spreadsheet apps — "CSV injection". Prefixing those with a single
 * quote forces them to render as text. (OWASP's recommended mitigation.)
 */
const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value) {
  if (value === null || value === undefined) return '""';
  let text = String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(rows, columns) {
  const head = columns.map((c) => cell(c.label)).join(',');
  const body = rows.map((row) => columns.map((c) => cell(c.get(row))).join(','));
  // A BOM so Excel opens UTF-8 (names, ₹) correctly.
  return '﻿' + [head, ...body].join('\r\n');
}

export function downloadCsv(filename, csv) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* Only ever turn participant-supplied text into a link if it is plain https. */
export const safeHttps = (value) =>
  typeof value === 'string' && /^https:\/\/[^\s"'<>]+$/i.test(value.trim()) ? value.trim() : null;
