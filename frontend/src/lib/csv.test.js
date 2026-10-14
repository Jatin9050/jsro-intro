import { safeHttps, toCsv } from './csv';

const cols = [{ label: 'Name', get: (r) => r.name }, { label: 'Phone', get: (r) => r.phone }];
const body = (csv) => csv.replace(/^﻿/, '').split('\r\n').slice(1);

describe('toCsv — formula injection', () => {
  test.each([
    ['=HYPERLINK("http://evil","click")'],
    ['+cmd|" /C calc"!A0'],
    ['-2+3'],
    ['@SUM(1+1)'],
    ['\t=1+1'],
    ['\r=1+1'],
  ])('neutralises a cell starting with a formula trigger: %s', (payload) => {
    const [line] = body(toCsv([{ name: payload, phone: '' }], cols));
    expect(line.startsWith(`"'`)).toBe(true);
  });

  test('leaves ordinary text alone', () => {
    const [line] = body(toCsv([{ name: 'Aarav Mehta', phone: '9876543210' }], cols));
    expect(line).toBe('"Aarav Mehta","9876543210"');
  });

  test('escapes embedded quotes and keeps commas inside one cell', () => {
    const [line] = body(toCsv([{ name: 'A "quoted", name', phone: '1' }], cols));
    expect(line).toBe('"A ""quoted"", name","1"');
  });

  test('a +91 phone number is kept as text rather than evaluated', () => {
    const [line] = body(toCsv([{ name: 'X', phone: '+919466317501' }], cols));
    expect(line).toBe(`"X","'+919466317501"`);
  });

  test('null and undefined become empty cells', () => {
    const [line] = body(toCsv([{ name: null, phone: undefined }], cols));
    expect(line).toBe('"",""');
  });

  test('starts with a UTF-8 BOM so Excel reads names correctly', () => {
    expect(toCsv([], cols).charCodeAt(0)).toBe(0xfeff);
  });
});

describe('safeHttps — participant links', () => {
  test.each([
    'javascript:alert(document.cookie)',
    'JavaScript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'http://insecure.example.com',
    'vbscript:msgbox(1)',
    'https://x.com/"onmouseover="alert(1)',
    '  ',
    null,
    undefined,
    42,
  ])('refuses %p', (value) => {
    expect(safeHttps(value)).toBeNull();
  });

  test('accepts a plain https link and trims it', () => {
    expect(safeHttps('  https://youtu.be/abc123 ')).toBe('https://youtu.be/abc123');
  });
});
