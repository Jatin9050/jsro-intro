import { checkPdf, MAX_PDF_BYTES } from './pdfCheck';

// jsdom 16 predates Blob.arrayBuffer; every browser this site supports has it.
beforeAll(() => {
  if (!Blob.prototype.arrayBuffer) {
    Blob.prototype.arrayBuffer = function arrayBuffer() {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsArrayBuffer(this);
      });
    };
  }
});

const pdf = (name = 'project.pdf', extra = 'body') => new File([`%PDF-1.7\n${extra}`], name, { type: 'application/pdf' });

test('accepts a real PDF', async () => {
  expect(await checkPdf(pdf())).toBeNull();
});

test('requires a file', async () => {
  expect(await checkPdf(null)).toMatch(/attach/i);
});

test('refuses a non-.pdf name', async () => {
  expect(await checkPdf(new File(['%PDF-1.7'], 'project.docx', { type: 'application/pdf' }))).toMatch(/\.pdf/);
});

test('refuses a wrong MIME type', async () => {
  expect(await checkPdf(new File(['%PDF-1.7'], 'x.pdf', { type: 'image/png' }))).toMatch(/must be a PDF/i);
});

test('refuses an empty file', async () => {
  expect(await checkPdf(new File([], 'x.pdf', { type: 'application/pdf' }))).toMatch(/empty/i);
});

test('refuses a renamed non-PDF by its signature', async () => {
  const fake = new File(['PK\u0003\u0004 this is really a zip'], 'project.pdf', { type: 'application/pdf' });
  expect(await checkPdf(fake)).toMatch(/not a PDF/i);
});

test('refuses a file over 10 MB and says how big it is', async () => {
  const big = pdf('big.pdf');
  Object.defineProperty(big, 'size', { value: MAX_PDF_BYTES + 1 });
  expect(await checkPdf(big)).toMatch(/10\.00 MB.*limit is 10 MB/);
});
