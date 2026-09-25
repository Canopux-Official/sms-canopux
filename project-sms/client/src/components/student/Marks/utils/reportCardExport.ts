import logoUrl from '../../../../assets/logo.jpeg';
import { PAGE_H, PAGE_W, drawReportCard } from './reportCardRenderer';
import type { ReportCardData } from './reportCardRenderer';

/** The canvas is drawn at 2x the logical page size (~190 dpi on A4). */
const RENDER_SCALE = 2;

/* -------------------------------------------------------------------------- */
/*  Asset loading                                                             */
/* -------------------------------------------------------------------------- */

const loadImage = (src: string, crossOrigin = false): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });

/** Resolves to null (instead of rejecting / hanging) if the image cannot be loaded in time. */
const loadImageSafe = async (src: string | undefined, crossOrigin: boolean, timeoutMs: number): Promise<HTMLImageElement | null> => {
  if (!src) return null;
  try {
    return await Promise.race([
      loadImage(src, crossOrigin),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
  } catch {
    return null;
  }
};

const ensureFonts = async (): Promise<void> => {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await Promise.all([
      document.fonts.load('400 12px "Open Sans"'),
      document.fonts.load('600 12px "Open Sans"'),
      document.fonts.load('600 12px "Montserrat"'),
      document.fonts.load('700 12px "Montserrat"'),
    ]);
  } catch {
    /* fall back to system fonts */
  }
};

/* -------------------------------------------------------------------------- */
/*  Rendering                                                                 */
/* -------------------------------------------------------------------------- */

export const renderReportCardCanvas = async (data: ReportCardData): Promise<HTMLCanvasElement> => {
  await ensureFonts();

  const [crest, photo] = await Promise.all([
    loadImageSafe(logoUrl, false, 10000),
    // crossOrigin is required so the canvas is not tainted (Cloudinary sends CORS headers).
    loadImageSafe(data.student?.profilePhoto, true, 8000),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(PAGE_W * RENDER_SCALE);
  canvas.height = Math.round(PAGE_H * RENDER_SCALE);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser.');

  ctx.scale(RENDER_SCALE, RENDER_SCALE);
  drawReportCard(ctx, data, { crest, photo });
  return canvas;
};

export const canvasToBlob = (canvas: HTMLCanvasElement, type: 'image/jpeg' | 'image/png', quality?: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not create the image.'))),
      type,
      quality
    );
  });

/* -------------------------------------------------------------------------- */
/*  PDF (single A4 page holding the rendered JPEG) — no external library      */
/* -------------------------------------------------------------------------- */

const A4_W_PT = 595.28;
const A4_H_PT = 841.89;

const pdfSafe = (text: string): string =>
  text
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[()\\]/g, '')
    .slice(0, 120);

const pdfDate = (d: Date): string => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `D:${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
};

export const buildPdfFromJpeg = (jpeg: Uint8Array, imgW: number, imgH: number, title: string): Blob => {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;

  const push = (data: string | Uint8Array) => {
    const bytes = typeof data === 'string' ? enc.encode(data) : data;
    parts.push(bytes);
    length += bytes.length;
  };
  const beginObj = (n: number) => {
    offsets[n] = length;
    push(`${n} 0 obj\n`);
  };

  // Header + binary marker comment (tells tools the file contains binary data)
  push('%PDF-1.4\n');
  push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  beginObj(1);
  push('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  beginObj(2);
  push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  beginObj(3);
  push(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_W_PT} ${A4_H_PT}] ` +
      '/Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>\nendobj\n'
  );

  beginObj(4);
  push(
    `<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB ` +
      `/BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`
  );
  push(jpeg);
  push('\nendstream\nendobj\n');

  const content = `q\n${A4_W_PT} 0 0 ${A4_H_PT} 0 0 cm\n/Im0 Do\nQ\n`;
  beginObj(5);
  push(`<< /Length ${enc.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`);

  beginObj(6);
  push(`<< /Title (${pdfSafe(title)}) /Producer (Student Management System) /CreationDate (${pdfDate(new Date())}) >>\nendobj\n`);

  const xrefOffset = length;
  let xref = 'xref\n0 7\n0000000000 65535 f \n';
  for (let n = 1; n <= 6; n++) {
    xref += `${String(offsets[n]).padStart(10, '0')} 00000 n \n`;
  }
  push(xref);
  push(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  const out = new Uint8Array(length);
  let pos = 0;
  for (const part of parts) {
    out.set(part, pos);
    pos += part.length;
  }
  return new Blob([out], { type: 'application/pdf' });
};

/* -------------------------------------------------------------------------- */
/*  Download helpers                                                          */
/* -------------------------------------------------------------------------- */

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

export const buildFileBaseName = (enrollmentNumber: string | undefined, testName: string): string => {
  const slug = (s: string) =>
    s
      .replace(/[^A-Za-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40);
  return ['Report_Card', slug(enrollmentNumber || ''), slug(testName)].filter(Boolean).join('_');
};