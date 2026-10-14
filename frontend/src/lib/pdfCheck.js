/*
 * Client-side PDF checks. These help an honest entrant catch a wrong file
 * before a 10 MB upload; they are not the security boundary. The storage
 * bucket independently enforces the MIME allow-list, the 10 MB limit and the
 * .pdf extension, and refuses anything else.
 */

export const MAX_PDF_BYTES = 10 * 1024 * 1024;

// Every PDF begins with the bytes "%PDF-". A renamed .docx or .jpg does not.
async function hasPdfSignature(file) {
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return [0x25, 0x50, 0x44, 0x46, 0x2d].every((byte, i) => head[i] === byte);
}

export async function checkPdf(file) {
  if (!file) return 'Attach your project document as a PDF.';
  if (!/\.pdf$/i.test(file.name)) return 'The document must be a .pdf file.';
  if (file.type && file.type !== 'application/pdf') return 'The document must be a PDF.';
  if (file.size === 0) return 'That file is empty. Choose your project PDF again.';
  if (file.size > MAX_PDF_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(2);
    return `That PDF is ${mb} MB. The limit is 10 MB — compress the images or export at a lower quality.`;
  }
  if (!(await hasPdfSignature(file))) {
    return 'That file is named .pdf but is not a PDF. Export or save it as a PDF and try again.';
  }
  return null;
}
