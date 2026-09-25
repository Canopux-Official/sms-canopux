import type { StudentMarkRow } from '../services/StudentMarksApi';

/* -------------------------------------------------------------------------- */
/*  Public types                                                              */
/* -------------------------------------------------------------------------- */

/** Logical page size in CSS px (A4 @ 96dpi). The canvas is scaled up from this. */
export const PAGE_W = 794;
export const PAGE_H = 1123;

export interface ReportStudent {
  name?: string;
  enrollmentNumber?: string;
  dob?: string;
  currentClass?: string;
  academicSession?: string;
  profilePhoto?: string;
  stream?: { name?: string } | null;
  targetExams?: { name?: string }[];
}

export interface ReportInstitute {
  name: string;
  tagline: string;
  address?: string;
  phones?: string[];
  email?: string;
}

/**
 * Institute identity printed in the report card header. The name and tagline
 * match the institute crest (assets/logo.jpeg). Address, phone and e-mail are
 * filled in at runtime from the landing-page footer content when available.
 */
export const DEFAULT_INSTITUTE: ReportInstitute = {
  name: 'JJ Institute of Science',
  tagline: 'In The Pursuit Of Excellence',
};

export interface ReportCardData {
  mark: StudentMarkRow;
  student: ReportStudent | null;
  institute: ReportInstitute;
  generatedAt: Date;
}

export interface ReportCardAssets {
  /** The institute logo image (the full logo.jpeg — the crest is cropped out of it here). */
  crest: CanvasImageSource | null;
  /** The student's profile photo, or null if unavailable. */
  photo: CanvasImageSource | null;
}

/* -------------------------------------------------------------------------- */
/*  Look & feel                                                               */
/* -------------------------------------------------------------------------- */

const FONT_SANS = '"Open Sans", "Helvetica Neue", Arial, sans-serif';
const FONT_HEAD = '"Montserrat", "Open Sans", "Helvetica Neue", Arial, sans-serif';
const FONT_SERIF = 'Georgia, "Times New Roman", "Noto Serif", serif';

const C = {
  teal: '#0A4A52',
  tealDark: '#06353B',
  tealTint: '#EDF3F3',
  gold: '#B08A3E',
  goldLight: '#E6D9B8',
  ink: '#1B2A2E',
  muted: '#5D6E72',
  line: '#C5D2D3',
  track: '#EBF0F0',
  slate: '#7B8D91',
  white: '#FFFFFF',
};

/**
 * Remark bands, highest first. Edit the thresholds / wording here if the
 * institute uses a different scale — the legend on the report card is
 * generated from this list automatically.
 */
export const REMARK_SCALE: { min: number; label: string }[] = [
  { min: 90, label: 'Outstanding' },
  { min: 75, label: 'Excellent' },
  { min: 60, label: 'Very Good' },
  { min: 50, label: 'Good' },
  { min: 40, label: 'Satisfactory' },
  { min: 0, label: 'Needs Improvement' },
];

/** Same colour thresholds as the on-screen marks cards (75 / 50). */
const remarkColor = (pct: number): string => {
  if (pct >= 75) return '#2E7D32';
  if (pct >= 50) return '#B26A00';
  return '#C62828';
};

export const getRemark = (pct: number): string => {
  const band = REMARK_SCALE.find((b) => pct >= b.min);
  return band ? band.label : REMARK_SCALE[REMARK_SCALE.length - 1].label;
};

/**
 * Where the round crest sits inside src/assets/logo.jpeg (1080 x 1080 px).
 * The crop is scaled proportionally if the image is ever replaced by another
 * resolution of the same artwork.
 */
const CREST_CROP = { x: 125, y: 30, w: 806, h: 738, ref: 1080 };

/* -------------------------------------------------------------------------- */
/*  Small helpers                                                             */
/* -------------------------------------------------------------------------- */

type Ctx = CanvasRenderingContext2D;

const setFont = (ctx: Ctx, weight: number | string, size: number, family = FONT_SANS, style = '') => {
  ctx.font = `${style ? style + ' ' : ''}${weight} ${size}px ${family}`;
};

const fmt = (n: number | null | undefined): string => {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/\.?0+$/, '');
};

const fmtDate = (value: string | Date | undefined | null): string => {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmtClass = (c: string | undefined | null): string => {
  if (!c) return '—';
  if (c.startsWith('dropper-')) return `Dropper ${c.split('-')[1]}`;
  return `Class ${c}`;
};

const sourceSize = (img: CanvasImageSource): { w: number; h: number } => {
  const i = img as unknown as { naturalWidth?: number; naturalHeight?: number; width: number; height: number };
  return { w: i.naturalWidth || i.width, h: i.naturalHeight || i.height };
};

const roundedRectPath = (ctx: Ctx, x: number, y: number, w: number, h: number, r: number) => {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
};

const line = (ctx: Ctx, x1: number, y1: number, x2: number, y2: number, color: string, width = 1) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
};

/**
 * Shrinks the font until the text fits, then falls back to an ellipsis.
 * Leaves ctx.font set to the size that was finally used.
 */
const fitText = (
  ctx: Ctx,
  text: string,
  maxW: number,
  weight: number | string,
  size: number,
  family = FONT_SANS,
  minSize = 8,
  style = ''
): string => {
  let s = size;
  setFont(ctx, weight, s, family, style);
  while (ctx.measureText(text).width > maxW && s > minSize) {
    s -= 0.5;
    setFont(ctx, weight, s, family, style);
  }
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t.trimEnd() + '…';
};

/** Word-wraps text (respecting explicit line breaks) into at most maxLines lines. */
const wrapLines = (ctx: Ctx, text: string, maxW: number, maxLines: number): string[] => {
  const all: string[] = [];

  for (const para of String(text).replace(/\r/g, '').split('\n')) {
    const words = para.split(/\s+/).filter(Boolean);
    let current = '';
    for (const w of words) {
      let word = w;
      // Break words that are wider than a whole line.
      while (ctx.measureText(word).width > maxW && word.length > 1) {
        let cut = word.length - 1;
        while (cut > 1 && ctx.measureText(word.slice(0, cut)).width > maxW) cut--;
        if (current) {
          all.push(current);
          current = '';
        }
        all.push(word.slice(0, cut));
        word = word.slice(cut);
      }
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxW) {
        current = candidate;
      } else {
        if (current) all.push(current);
        current = word;
      }
    }
    if (current) all.push(current);
  }

  if (all.length <= maxLines) return all;

  const lines = all.slice(0, maxLines);
  let last = lines[maxLines - 1];
  while (last.length > 1 && ctx.measureText(last + '…').width > maxW) last = last.slice(0, -1);
  lines[maxLines - 1] = last.trimEnd() + '…';
  return lines;
};

const measureSpaced = (ctx: Ctx, text: string, spacing: number): number => {
  const chars = Array.from(text);
  return chars.reduce((sum, c) => sum + ctx.measureText(c).width, 0) + spacing * Math.max(chars.length - 1, 0);
};

/** Draws letter-spaced text (canvas letterSpacing is not supported everywhere). */
const drawSpaced = (ctx: Ctx, text: string, x: number, y: number, spacing: number, align: 'left' | 'center') => {
  const chars = Array.from(text);
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * Math.max(chars.length - 1, 0);
  let cx = align === 'center' ? x - total / 2 : x;
  ctx.textAlign = 'left';
  chars.forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i] + spacing;
  });
};

const drawImageCover = (ctx: Ctx, img: CanvasImageSource, x: number, y: number, w: number, h: number) => {
  const { w: iw, h: ih } = sourceSize(img);
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) * 0.25; // bias towards the top so faces are not cropped
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
};

/** Crop rectangle of the crest, in source-image pixels. */
const crestRect = (img: CanvasImageSource) => {
  const { w: iw } = sourceSize(img);
  const k = iw / CREST_CROP.ref;
  return { sx: CREST_CROP.x * k, sy: CREST_CROP.y * k, sw: CREST_CROP.w * k, sh: CREST_CROP.h * k };
};

const CREST_ASPECT = CREST_CROP.w / CREST_CROP.h;

const sectionTitle = (ctx: Ctx, title: string, x: number, y: number, w: number) => {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.teal;
  setFont(ctx, 700, 13.5, FONT_SERIF);
  ctx.fillText(title, x, y);
  const tw = ctx.measureText(title).width;
  line(ctx, x + tw + 10, y - 4.5, x + w, y - 4.5, C.goldLight, 1);
};

interface Field {
  label: string;
  value: string;
  labelW: number;
  valueW: number;
  bold?: boolean;
}

/** Draws one row of "label | value" cells and its dividers. Outer border is drawn by the caller. */
const drawFieldRow = (ctx: Ctx, x: number, y: number, h: number, fields: Field[]) => {
  let cx = x;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  fields.forEach((f, i) => {
    ctx.fillStyle = C.tealTint;
    ctx.fillRect(cx, y, f.labelW, h);

    ctx.fillStyle = C.tealDark;
    const label = fitText(ctx, f.label, f.labelW - 18, 600, 10.5, FONT_SANS, 8);
    ctx.fillText(label, cx + 10, y + h / 2 + 0.5);

    ctx.fillStyle = C.ink;
    const value = fitText(ctx, f.value || '—', f.valueW - 20, 600, f.bold ? 13 : 12, FONT_SANS, 8.5);
    ctx.fillText(value, cx + f.labelW + 10, y + h / 2 + 0.5);

    line(ctx, cx + f.labelW, y, cx + f.labelW, y + h, C.line);
    cx += f.labelW + f.valueW;
    if (i < fields.length - 1) line(ctx, cx, y, cx, y + h, C.line);
  });
  const totalW = cx - x;
  line(ctx, x, y + h, x + totalW, y + h, C.line);
  ctx.textBaseline = 'alphabetic';
};

/* -------------------------------------------------------------------------- */
/*  Main drawing routine                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Draws the complete A4 report card. The context must already be scaled so
 * that one unit equals one logical pixel of the 794 x 1123 page.
 */
export function drawReportCard(ctx: Ctx, data: ReportCardData, assets: ReportCardAssets): void {
  const { mark, student, institute, generatedAt } = data;

  const M = 48; // content left edge
  const CW = PAGE_W - M * 2; // content width (698)
  const RIGHT = M + CW;
  const isAbsent = !!mark.isAbsent;
  const pct = mark.percentage ?? 0;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // ---- Paper -------------------------------------------------------------
  ctx.fillStyle = C.white;
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);

  // ---- Frame -------------------------------------------------------------
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(16, 16, PAGE_W - 32, PAGE_H - 32);
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 0.9;
  ctx.strokeRect(23, 23, PAGE_W - 46, PAGE_H - 46);

  // ---- Watermark ---------------------------------------------------------
  if (assets.crest) {
    const r = crestRect(assets.crest);
    const wmH = 400;
    const wmW = wmH * CREST_ASPECT;
    ctx.save();
    ctx.globalAlpha = 0.045;
    ctx.globalCompositeOperation = 'multiply'; // white background of the JPEG disappears
    ctx.drawImage(assets.crest, r.sx, r.sy, r.sw, r.sh, (PAGE_W - wmW) / 2, 470, wmW, wmH);
    ctx.restore();
  }

  // ---- Header ------------------------------------------------------------
  const headerTop = 46;
  const crestH = 96;
  let crestW = 0;
  if (assets.crest) {
    const r = crestRect(assets.crest);
    crestW = crestH * CREST_ASPECT;
    ctx.drawImage(assets.crest, r.sx, r.sy, r.sw, r.sh, M + 4, headerTop, crestW, crestH);
  }

  const textMaxW = PAGE_W - 2 * (M + 4 + (assets.crest ? crestW : 0) + 14);
  const cx = PAGE_W / 2;

  // Institute name (letter-spaced serif, shrunk to fit)
  const instName = institute.name.toUpperCase();
  let nameSize = 28;
  const nameSpacing = 1.4;
  setFont(ctx, 700, nameSize, FONT_SERIF);
  while (measureSpaced(ctx, instName, nameSpacing) > textMaxW && nameSize > 14) {
    nameSize -= 0.5;
    setFont(ctx, 700, nameSize, FONT_SERIF);
  }
  ctx.fillStyle = C.teal;
  ctx.textBaseline = 'alphabetic';
  drawSpaced(ctx, instName, cx, headerTop + 40, nameSpacing, 'center');

  // Tagline
  ctx.fillStyle = C.gold;
  ctx.textAlign = 'center';
  const tagline = fitText(ctx, institute.tagline, textMaxW, 400, 13, FONT_SERIF, 9, 'italic');
  ctx.fillText(tagline, cx, headerTop + 62);

  // Address / contact
  let infoY = headerTop + 82;
  ctx.fillStyle = C.muted;
  ctx.textAlign = 'center';
  if (institute.address && institute.address.trim()) {
    setFont(ctx, 400, 10);
    const addrLines = wrapLines(ctx, institute.address.trim(), textMaxW, 2);
    addrLines.forEach((l) => {
      ctx.fillText(l, cx, infoY);
      infoY += 13;
    });
  }
  const contactBits: string[] = [];
  const phones = (institute.phones || []).filter((p) => p && p.trim());
  if (phones.length) contactBits.push(`Phone: ${phones.slice(0, 2).join(', ')}`);
  if (institute.email && institute.email.trim()) contactBits.push(`Email: ${institute.email.trim()}`);
  if (contactBits.length) {
    const contact = fitText(ctx, contactBits.join('   |   '), textMaxW, 400, 10, FONT_SANS, 8);
    ctx.fillText(contact, cx, infoY);
  }

  // Header rule
  const ruleY = 166;
  line(ctx, M, ruleY, RIGHT, ruleY, C.teal, 2);
  line(ctx, M, ruleY + 4, RIGHT, ruleY + 4, C.gold, 0.9);

  // ---- Title band --------------------------------------------------------
  const bandY = 182;
  ctx.fillStyle = C.teal;
  ctx.fillRect(M, bandY, CW, 34);
  ctx.fillStyle = C.gold;
  ctx.fillRect(M, bandY + 34, CW, 2.5);
  ctx.fillStyle = C.white;
  setFont(ctx, 700, 17, FONT_SERIF);
  ctx.textBaseline = 'alphabetic';
  drawSpaced(ctx, 'REPORT CARD', cx, bandY + 23, 4, 'center');

  // Subtitle
  ctx.fillStyle = C.muted;
  ctx.textAlign = 'center';
  const session = student?.academicSession ? `Academic Session ${student.academicSession}` : '';
  const subtitle = ['Test Performance Report', session].filter(Boolean).join('   |   ');
  setFont(ctx, 400, 11.5, FONT_SERIF, 'italic');
  ctx.fillText(subtitle, cx, bandY + 56);

  // ---- Student details ---------------------------------------------------
  let y = 276;
  sectionTitle(ctx, 'Student Details', M, y, CW);
  y += 10;

  const photoW = 100;
  const photoH = 120;
  const fieldsW = CW - photoW - 12; // 586
  const rowH = 30;
  const boxTop = y;

  const streamName = student?.stream?.name || mark.stream || 'N/A';
  const examNames = student?.targetExams?.map((e) => e.name).filter(Boolean) as string[] | undefined;
  const examText = examNames && examNames.length ? examNames.join(', ') : mark.targetExam || '—';
  const studentClass = student?.currentClass || mark.classType;

  const lw = 108;
  const vw = (fieldsW - lw * 2) / 2; // 185
  drawFieldRow(ctx, M, y, rowH, [{ label: 'Student Name', value: student?.name || '—', labelW: lw, valueW: fieldsW - lw, bold: true }]);
  y += rowH;
  drawFieldRow(ctx, M, y, rowH, [
    { label: 'Enrollment No.', value: student?.enrollmentNumber || '—', labelW: lw, valueW: vw },
    { label: 'Class', value: fmtClass(studentClass), labelW: lw, valueW: vw },
  ]);
  y += rowH;
  drawFieldRow(ctx, M, y, rowH, [
    { label: 'Date of Birth', value: fmtDate(student?.dob), labelW: lw, valueW: vw },
    { label: 'Stream', value: streamName, labelW: lw, valueW: vw },
  ]);
  y += rowH;
  drawFieldRow(ctx, M, y, rowH, [
    { label: 'Session', value: student?.academicSession || '—', labelW: lw, valueW: vw },
    { label: 'Target Exam', value: examText, labelW: lw, valueW: vw },
  ]);
  y += rowH;
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(M, boxTop, fieldsW, y - boxTop);

  // Photo
  const photoX = RIGHT - photoW;
  if (assets.photo) {
    drawImageCover(ctx, assets.photo, photoX, boxTop, photoW, photoH);
  } else {
    ctx.fillStyle = C.tealTint;
    ctx.fillRect(photoX, boxTop, photoW, photoH);
    const initial = (student?.name || 'S').trim().charAt(0).toUpperCase() || 'S';
    ctx.beginPath();
    ctx.arc(photoX + photoW / 2, boxTop + 48, 26, 0, Math.PI * 2);
    ctx.fillStyle = C.teal;
    ctx.fill();
    ctx.fillStyle = C.white;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    setFont(ctx, 700, 26, FONT_HEAD);
    ctx.fillText(initial, photoX + photoW / 2, boxTop + 49);
    ctx.fillStyle = C.muted;
    setFont(ctx, 400, 9.5);
    ctx.fillText('Student photo', photoX + photoW / 2, boxTop + 98);
    ctx.textBaseline = 'alphabetic';
  }
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(photoX, boxTop, photoW, photoH);

  // ---- Examination details ----------------------------------------------
  y = boxTop + photoH + 30;
  sectionTitle(ctx, 'Examination Details', M, y, CW);
  y += 10;
  const examTop = y;

  const elw = 124;
  const evw = CW / 2 - elw; // 225
  drawFieldRow(ctx, M, y, rowH, [{ label: 'Test Name', value: mark.heading, labelW: elw, valueW: CW - elw, bold: true }]);
  y += rowH;
  drawFieldRow(ctx, M, y, rowH, [
    { label: 'Test Date', value: fmtDate(mark.testDate), labelW: elw, valueW: evw },
    { label: 'Maximum Marks', value: fmt(mark.totalMarks), labelW: elw, valueW: evw },
  ]);
  y += rowH;
  drawFieldRow(ctx, M, y, rowH, [
    { label: 'Students in Batch', value: String(mark.totalStudents ?? '—'), labelW: elw, valueW: evw },
    { label: 'Test Attendance', value: isAbsent ? 'Absent' : 'Present', labelW: elw, valueW: evw },
  ]);
  y += rowH;

  const desc = (mark.description || '').trim();
  if (desc) {
    setFont(ctx, 400, 10.5);
    const descLines = wrapLines(ctx, desc, CW - elw - 20, 3);
    const descH = Math.max(rowH, descLines.length * 14 + 14);
    ctx.fillStyle = C.tealTint;
    ctx.fillRect(M, y, elw, descH);
    ctx.fillStyle = C.tealDark;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    const dl = fitText(ctx, 'Syllabus / Notes', elw - 18, 600, 10.5, FONT_SANS, 8);
    ctx.fillText(dl, M + 10, y + 19);
    ctx.fillStyle = C.ink;
    setFont(ctx, 400, 10.5);
    descLines.forEach((l, i) => ctx.fillText(l, M + elw + 10, y + 19 + i * 14));
    line(ctx, M + elw, y, M + elw, y + descH, C.line);
    y += descH;
  }
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(M, examTop, CW, y - examTop);

  // ---- Result table ------------------------------------------------------
  y += 30;
  sectionTitle(ctx, 'Result', M, y, CW);
  y += 10;

  const cols = [
    { title: 'Test', w: 188, align: 'left' as const },
    { title: 'Max.\nMarks', w: 82, align: 'center' as const },
    { title: 'Marks\nObtained', w: 102, align: 'center' as const },
    { title: 'Percentage', w: 88, align: 'center' as const },
    { title: 'Class\nAverage', w: 82, align: 'center' as const },
    { title: 'Class\nHighest', w: 82, align: 'center' as const },
    { title: 'Rank', w: 74, align: 'center' as const },
  ];
  const headH = 36;
  const bodyH = 58;
  ctx.fillStyle = C.teal;
  ctx.fillRect(M, y, CW, headH);
  ctx.fillStyle = C.white;
  ctx.textBaseline = 'middle';
  let colX = M;
  cols.forEach((col) => {
    const titleLines = col.title.split('\n');
    titleLines.forEach((tl, i) => {
      const t = fitText(ctx, tl, col.w - 14, 600, 10.5, FONT_SANS, 8);
      const ty = y + headH / 2 + 0.5 + (i - (titleLines.length - 1) / 2) * 13;
      if (col.align === 'left') {
        ctx.textAlign = 'left';
        ctx.fillText(t, colX + 10, ty);
      } else {
        ctx.textAlign = 'center';
        ctx.fillText(t, colX + col.w / 2, ty);
      }
    });
    colX += col.w;
  });

  const rowTop = y + headH;
  const rowMid = rowTop + bodyH / 2;
  // Test name (2 lines max)
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  setFont(ctx, 600, 11.5);
  const nameLines = wrapLines(ctx, mark.heading, cols[0].w - 20, 2);
  const nlStart = rowMid - ((nameLines.length - 1) * 14) / 2 + 4;
  nameLines.forEach((l, i) => ctx.fillText(l, M + 10, nlStart + i * 14));

  const centers: number[] = [];
  {
    let cxx = M;
    cols.forEach((c) => {
      centers.push(cxx + c.w / 2);
      cxx += c.w;
    });
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = C.ink;
  setFont(ctx, 600, 12.5);
  ctx.fillText(fmt(mark.totalMarks), centers[1], rowMid + 0.5);

  if (isAbsent) {
    ctx.fillStyle = '#C62828';
    setFont(ctx, 700, 12.5, FONT_HEAD);
    ctx.fillText('ABSENT', centers[2], rowMid + 0.5);
    ctx.fillStyle = C.muted;
    setFont(ctx, 600, 13);
    ctx.fillText('—', centers[3], rowMid + 0.5);
    ctx.fillText('—', centers[6], rowMid + 0.5);
  } else {
    ctx.fillStyle = C.tealDark;
    setFont(ctx, 700, 18, FONT_HEAD);
    ctx.fillText(fmt(mark.marksObtained), centers[2], rowMid + 0.5);

    ctx.fillStyle = remarkColor(pct);
    setFont(ctx, 700, 14, FONT_HEAD);
    ctx.fillText(`${fmt(pct)}%`, centers[3], rowMid + 0.5);

    ctx.fillStyle = C.ink;
    setFont(ctx, 700, 15, FONT_HEAD);
    ctx.fillText(mark.rank ? `#${mark.rank}` : '—', centers[6], rowMid - 7);
    ctx.fillStyle = C.muted;
    setFont(ctx, 400, 9.5);
    ctx.fillText(`of ${mark.totalStudents}`, centers[6], rowMid + 11);
  }
  ctx.fillStyle = C.ink;
  setFont(ctx, 600, 12.5);
  ctx.fillText(fmt(mark.classAverage), centers[4], rowMid + 0.5);
  ctx.fillText(fmt(mark.classHighest), centers[5], rowMid + 0.5);

  // Grid lines of the table
  {
    let lx = M;
    cols.forEach((c, i) => {
      lx += c.w;
      if (i < cols.length - 1) line(ctx, lx, rowTop, lx, rowTop + bodyH, C.line);
    });
  }
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(M, rowTop, CW, bodyH);
  ctx.textBaseline = 'alphabetic';
  y = rowTop + bodyH;

  // ---- Performance comparison -------------------------------------------
  y += 28;
  sectionTitle(ctx, 'Performance Comparison', M, y, CW);
  y += 12;

  const labelW = 118;
  const valueW = 96;
  const trackX = M + labelW;
  const trackW = CW - labelW - valueW - 8;
  const barH = 12;
  const barRow = 27;
  const total = mark.totalMarks > 0 ? mark.totalMarks : 1;
  const bars = [
    { label: 'Your score', value: isAbsent ? null : mark.marksObtained, color: C.teal },
    { label: 'Class average', value: mark.classAverage, color: C.gold },
    { label: 'Class highest', value: mark.classHighest, color: C.slate },
  ];
  const barsTop = y;
  bars.forEach((b, i) => {
    const cy = barsTop + i * barRow + barRow / 2;
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    setFont(ctx, 600, 11);
    ctx.fillText(b.label, M, cy + 0.5);

    roundedRectPath(ctx, trackX, cy - barH / 2, trackW, barH, barH / 2);
    ctx.fillStyle = C.track;
    ctx.fill();

    if (b.value === null || b.value === undefined) {
      ctx.fillStyle = C.muted;
      ctx.textAlign = 'left';
      setFont(ctx, 400, 10, FONT_SANS, 'italic');
      ctx.fillText('Absent for this test', trackX + 10, cy + 0.5);
    } else {
      const frac = Math.max(0, Math.min(1, b.value / total));
      const fw = frac > 0 ? Math.max(barH, frac * trackW) : 0;
      if (fw > 0) {
        roundedRectPath(ctx, trackX, cy - barH / 2, fw, barH, barH / 2);
        ctx.fillStyle = b.color;
        ctx.fill();
      }
      ctx.fillStyle = C.ink;
      ctx.textAlign = 'right';
      setFont(ctx, 600, 11);
      ctx.fillText(`${fmt(b.value)} / ${fmt(mark.totalMarks)}`, RIGHT, cy + 0.5);
    }
  });
  // quarter gridlines
  [0.25, 0.5, 0.75].forEach((f) => {
    line(ctx, trackX + trackW * f, barsTop + 3, trackX + trackW * f, barsTop + bars.length * barRow - 3, 'rgba(255,255,255,0.85)', 1.2);
  });
  // axis labels
  ctx.fillStyle = C.muted;
  ctx.textBaseline = 'alphabetic';
  setFont(ctx, 400, 8.5);
  const axisY = barsTop + bars.length * barRow + 9;
  ctx.textAlign = 'left';
  ctx.fillText('0', trackX, axisY);
  ctx.textAlign = 'center';
  ctx.fillText(fmt(mark.totalMarks / 2), trackX + trackW / 2, axisY);
  ctx.textAlign = 'right';
  ctx.fillText(fmt(mark.totalMarks), trackX + trackW, axisY);
  y = axisY;

  // ---- Remarks -----------------------------------------------------------
  y += 26;
  sectionTitle(ctx, 'Remarks', M, y, CW);
  y += 10;
  const remH = 58;
  ctx.fillStyle = C.tealTint;
  ctx.fillRect(M, y, CW, remH);
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(M, y, CW, remH);

  const pillW = 128;
  const pillH = 30;
  const pillX = M + 14;
  const pillY = y + (remH - pillH) / 2;
  const remarkLabel = isAbsent ? 'Absent' : getRemark(pct);
  roundedRectPath(ctx, pillX, pillY, pillW, pillH, 15);
  ctx.fillStyle = isAbsent ? '#C62828' : remarkColor(pct);
  ctx.fill();
  ctx.fillStyle = C.white;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const pillText = fitText(ctx, remarkLabel, pillW - 16, 700, 12, FONT_HEAD, 8.5);
  ctx.fillText(pillText, pillX + pillW / 2, pillY + pillH / 2 + 0.5);

  let summary: string;
  if (isAbsent) {
    summary = 'The student was absent for this test, so no marks or rank have been awarded.';
  } else {
    const diff = (mark.marksObtained ?? 0) - mark.classAverage;
    const cmp =
      Math.abs(diff) < 0.005
        ? 'exactly in line with the class average'
        : diff > 0
        ? `${fmt(Number(diff.toFixed(2)))} marks above the class average`
        : `${fmt(Number(Math.abs(diff).toFixed(2)))} marks below the class average`;
    summary =
      `Scored ${fmt(mark.marksObtained)} out of ${fmt(mark.totalMarks)} (${fmt(pct)}%) and ranked ` +
      `${mark.rank ?? '—'} among ${mark.totalStudents} students, ${cmp}.`;
  }
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  setFont(ctx, 400, 11.5);
  const sumLines = wrapLines(ctx, summary, CW - pillW - 14 - 14 - 16, 3);
  const sumStart = y + remH / 2 - ((sumLines.length - 1) * 15) / 2 + 4;
  sumLines.forEach((l, i) => ctx.fillText(l, pillX + pillW + 16, sumStart + i * 15));
  y += remH;

  // Legend
  y += 17;
  const legend =
    'Remark scale:  ' +
    REMARK_SCALE.map((b, i) => {
      const upper = i === 0 ? null : REMARK_SCALE[i - 1].min - 1;
      const range = i === 0 ? `${b.min}% and above` : b.min === 0 ? `below ${upper! + 1}%` : `${b.min}-${upper}%`;
      return `${range} ${b.label}`;
    }).join('   |   ');
  ctx.fillStyle = C.muted;
  ctx.textAlign = 'center';
  const legendText = fitText(ctx, legend, CW, 400, 8.5, FONT_SANS, 6.5);
  ctx.fillText(legendText, cx, y);

  // ---- Signatures --------------------------------------------------------
  const sigLineY = 1006;
  const sigW = 190;
  const sigGap = (CW - sigW * 3) / 2;
  const sigLabels = ['Class Teacher', 'Parent / Guardian', 'Director / Principal'];
  sigLabels.forEach((label, i) => {
    const sx = M + i * (sigW + sigGap);
    line(ctx, sx, sigLineY, sx + sigW, sigLineY, C.ink, 0.8);
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'center';
    setFont(ctx, 700, 11, FONT_SERIF);
    ctx.fillText(label, sx + sigW / 2, sigLineY + 16);
  });

  // ---- Footer ------------------------------------------------------------
  const footY = 1046;
  line(ctx, M, footY, RIGHT, footY, C.goldLight, 1);
  ctx.fillStyle = C.muted;
  ctx.textAlign = 'center';
  const f1 = fitText(ctx, `This is a computer-generated report card issued by ${institute.name}.`, CW, 400, 9.5, FONT_SANS, 7);
  ctx.fillText(f1, cx, footY + 15);
  const ref = String(mark.testId || '').slice(-6).toUpperCase();
  const f2Parts = [`Generated on ${fmtDate(generatedAt)}`];
  if (student?.enrollmentNumber) f2Parts.push(`Enrollment No. ${student.enrollmentNumber}`);
  if (ref) f2Parts.push(`Ref. ${ref}`);
  const f2 = fitText(ctx, f2Parts.join('   |   '), CW, 400, 9, FONT_SANS, 7);
  ctx.fillText(f2, cx, footY + 29);

  ctx.restore();
}