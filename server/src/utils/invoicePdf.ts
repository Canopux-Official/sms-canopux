// server/src/utils/invoicePdf.ts
//
// Renders an invoice to a PDF Buffer. Used by BOTH the platform admin download
// (/platform/invoices/:id/pdf) and the institute's own billing page (/admin/billing/...).
// pdfkit's built-in Helvetica can't draw the rupee glyph, so amounts print as "INR 1,234.00".
import PDFDocument from 'pdfkit';
import { formatDateDMY, formatMoney } from './billing';

export interface InvoicePdfData {
    invoiceNumber: string;
    status: 'draft' | 'issued' | 'paid' | 'void' | string;
    issueDate?: Date | string;
    dueDate?: Date | string | null;
    paidAt?: Date | string | null;
    amountPaid?: number;
    balanceDue?: number;
    paymentMethod?: string;
    paymentReference?: string;
    seller?: { name?: string; email?: string; phone?: string; address?: string; gstin?: string; paymentInstructions?: string };
    billedTo?: { name?: string; contactName?: string; email?: string; phone?: string; address?: string; gstin?: string };
    periodStart?: Date | string | null;
    periodEnd?: Date | string | null;
    items: { description: string; quantity: number; unitPrice: number; amount: number }[];
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    taxPercent: number;
    taxAmount: number;
    total: number;
    currency?: string;
    notes?: string;
    terms?: string;
}

const COLORS = {
    brand: '#0b2021',
    brandLight: '#203A43',
    accent: '#FFD700',
    text: '#1c2b33',
    muted: '#6b7c85',
    line: '#e2e8ec',
    headerBg: '#f1f5f7',
};

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
    draft: { label: 'DRAFT', color: '#6b7c85' },
    issued: { label: 'UNPAID', color: '#c77700' },
    paid: { label: 'PAID', color: '#1b7f3b' },
    void: { label: 'VOID', color: '#c62828' },
};

const PAGE_MARGIN = 50;

export const renderInvoicePdf = (invoice: InvoicePdfData): Promise<Buffer> =>
    new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN, bufferPages: true, info: { Title: `Invoice ${invoice.invoiceNumber}` } });
            const chunks: Buffer[] = [];
            doc.on('data', (c: Buffer) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const currency = invoice.currency || 'INR';
            const money = (n: number) => formatMoney(n, currency);
            const pageWidth = doc.page.width;
            const contentWidth = pageWidth - PAGE_MARGIN * 2;
            const bottomLimit = () => doc.page.height - 90;

            // ---------------------------------------------------------------- header band
            doc.rect(0, 0, pageWidth, 96).fill(COLORS.brand);
            doc.rect(0, 96, pageWidth, 4).fill(COLORS.accent);

            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20)
                .text(invoice.seller?.name || 'Canopux', PAGE_MARGIN, 34, { width: contentWidth * 0.55, lineBreak: false });
            doc.font('Helvetica').fontSize(9).fillColor('#b9c8cf')
                .text('Student Management System', PAGE_MARGIN, 60, { width: contentWidth * 0.55, lineBreak: false });

            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(26)
                .text('INVOICE', PAGE_MARGIN, 28, { width: contentWidth, align: 'right', lineBreak: false });
            doc.font('Helvetica').fontSize(10).fillColor(COLORS.accent)
                .text(invoice.invoiceNumber, PAGE_MARGIN, 62, { width: contentWidth, align: 'right', lineBreak: false });

            // ---------------------------------------------------------------- status badge
            const st = STATUS_STYLE[invoice.status] || STATUS_STYLE.draft;
            const badgeW = 70;
            doc.roundedRect(pageWidth - PAGE_MARGIN - badgeW, 116, badgeW, 22, 4).fill(st.color);
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10)
                .text(st.label, pageWidth - PAGE_MARGIN - badgeW, 122, { width: badgeW, align: 'center', lineBreak: false });

            // ---------------------------------------------------------------- parties + dates
            let y = 118;
            const colGap = 20;
            const colW = (contentWidth - badgeW - colGap * 2) / 2;

            const partyBlock = (title: string, x: number, lines: (string | undefined)[]) => {
                doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(8).text(title.toUpperCase(), x, y, { width: colW, lineBreak: false });
                let ly = y + 14;
                lines.filter((l) => l && l.trim()).forEach((line, idx) => {
                    doc.fillColor(idx === 0 ? COLORS.text : COLORS.muted)
                        .font(idx === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(idx === 0 ? 11 : 9);
                    const h = doc.heightOfString(line as string, { width: colW });
                    doc.text(line as string, x, ly, { width: colW });
                    ly += h + 2;
                });
                return ly;
            };

            const s = invoice.seller || {};
            const b = invoice.billedTo || {};
            const yFrom = partyBlock('From', PAGE_MARGIN, [
                s.name, s.address, s.email, s.phone, s.gstin ? `GSTIN: ${s.gstin}` : undefined,
            ]);
            const yTo = partyBlock('Billed to', PAGE_MARGIN + colW + colGap, [
                b.name, b.contactName ? `Attn: ${b.contactName}` : undefined, b.address, b.email, b.phone,
                b.gstin ? `GSTIN: ${b.gstin}` : undefined,
            ]);
            y = Math.max(yFrom, yTo, 150) + 10;

            // date strip
            doc.roundedRect(PAGE_MARGIN, y, contentWidth, 46, 6).fill(COLORS.headerBg);
            const cells: [string, string][] = [
                ['Issue date', formatDateDMY(invoice.issueDate as Date)],
                ['Due date', formatDateDMY(invoice.dueDate as Date)],
                ['Service period', invoice.periodStart && invoice.periodEnd
                    ? `${formatDateDMY(invoice.periodStart as Date)} - ${formatDateDMY(invoice.periodEnd as Date)}` : '-'],
            ];
            const cellW = contentWidth / 3;
            cells.forEach(([label, value], i) => {
                const cx = PAGE_MARGIN + i * cellW + 14;
                doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(8).text(label.toUpperCase(), cx, y + 9, { width: cellW - 18, lineBreak: false });
                doc.fillColor(COLORS.text).font('Helvetica').fontSize(i === 2 ? 9 : 10.5).text(value, cx, y + 24, { width: cellW - 18, lineBreak: false });
            });
            y += 46 + 22;

            // ---------------------------------------------------------------- items table
            const colX = { idx: PAGE_MARGIN + 8, desc: PAGE_MARGIN + 34, qty: PAGE_MARGIN + contentWidth * 0.56, price: PAGE_MARGIN + contentWidth * 0.66, amt: PAGE_MARGIN + contentWidth * 0.83 };
            const colW2 = { desc: contentWidth * 0.56 - 40, qty: contentWidth * 0.08, price: contentWidth * 0.16, amt: contentWidth * 0.17 - 8 };

            const drawTableHeader = () => {
                doc.rect(PAGE_MARGIN, y, contentWidth, 24).fill(COLORS.brand);
                doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8.5);
                doc.text('#', colX.idx, y + 8, { width: 20, lineBreak: false });
                doc.text('DESCRIPTION', colX.desc, y + 8, { width: colW2.desc, lineBreak: false });
                doc.text('QTY', colX.qty, y + 8, { width: colW2.qty, align: 'right', lineBreak: false });
                doc.text('UNIT PRICE', colX.price, y + 8, { width: colW2.price, align: 'right', lineBreak: false });
                doc.text('AMOUNT', colX.amt, y + 8, { width: colW2.amt, align: 'right', lineBreak: false });
                y += 24;
            };
            drawTableHeader();

            const items = invoice.items.length ? invoice.items : [{ description: '-', quantity: 0, unitPrice: 0, amount: 0 }];
            items.forEach((item, i) => {
                doc.font('Helvetica').fontSize(9.5);
                const descH = doc.heightOfString(item.description || '-', { width: colW2.desc });
                const rowH = Math.max(24, descH + 14);
                if (y + rowH > bottomLimit()) {
                    doc.addPage();
                    y = PAGE_MARGIN;
                    drawTableHeader();
                }
                doc.font('Helvetica').fontSize(9.5); // drawTableHeader() leaves the bold header font active
                if (i % 2 === 1) doc.rect(PAGE_MARGIN, y, contentWidth, rowH).fill('#f8fafb');
                doc.fillColor(COLORS.muted).text(String(i + 1), colX.idx, y + 7, { width: 20, lineBreak: false });
                doc.fillColor(COLORS.text).text(item.description || '-', colX.desc, y + 7, { width: colW2.desc });
                doc.text(String(item.quantity), colX.qty, y + 7, { width: colW2.qty, align: 'right', lineBreak: false });
                doc.text(money(item.unitPrice), colX.price - 20, y + 7, { width: colW2.price + 20, align: 'right', lineBreak: false });
                doc.text(money(item.amount), colX.amt - 10, y + 7, { width: colW2.amt + 10, align: 'right', lineBreak: false });
                doc.moveTo(PAGE_MARGIN, y + rowH).lineTo(PAGE_MARGIN + contentWidth, y + rowH).lineWidth(0.5).strokeColor(COLORS.line).stroke();
                y += rowH;
            });

            // ---------------------------------------------------------------- totals
            const totalsRows: [string, string, boolean?][] = [['Subtotal', money(invoice.subtotal)]];
            if (invoice.discountAmount > 0 || invoice.discountPercent > 0) {
                totalsRows.push([`Discount (${invoice.discountPercent}%)`, `- ${money(invoice.discountAmount)}`]);
            }
            if (invoice.taxAmount > 0 || invoice.taxPercent > 0) {
                totalsRows.push([`Tax (${invoice.taxPercent}%)`, money(invoice.taxAmount)]);
            }
            const totalsHeight = totalsRows.length * 20 + 48;
            if (y + totalsHeight + 20 > bottomLimit()) {
                doc.addPage();
                y = PAGE_MARGIN;
            }
            y += 14;
            const tX = PAGE_MARGIN + contentWidth * 0.5;
            const tW = contentWidth * 0.5;
            totalsRows.forEach(([label, value]) => {
                doc.fillColor(COLORS.muted).font('Helvetica').fontSize(10).text(label, tX, y, { width: tW * 0.5, lineBreak: false });
                doc.fillColor(COLORS.text).text(value, tX + tW * 0.4, y, { width: tW * 0.6, align: 'right', lineBreak: false });
                y += 20;
            });
            doc.roundedRect(tX, y + 2, tW, 34, 6).fill(COLORS.brand);
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text('TOTAL', tX + 14, y + 13, { width: 80, lineBreak: false });
            doc.fillColor(COLORS.accent).fontSize(14).text(money(invoice.total), tX + 60, y + 11, { width: tW - 74, align: 'right', lineBreak: false });
            y += 34 + 24;

            if (invoice.status === 'paid') {
                const paidLine = [
                    `Paid on ${formatDateDMY(invoice.paidAt as Date)}`,
                    invoice.paymentMethod ? `via ${invoice.paymentMethod}` : '',
                    invoice.paymentReference ? `(ref: ${invoice.paymentReference})` : '',
                ].filter(Boolean).join(' ');
                doc.fillColor('#1b7f3b').font('Helvetica-Bold').fontSize(10).text(paidLine, PAGE_MARGIN, y, { width: contentWidth });
                y += 24;
            } else if (invoice.status === 'issued' && (invoice.amountPaid || 0) > 0) {
                doc.fillColor('#c77700').font('Helvetica-Bold').fontSize(10).text(
                    `Received ${money(invoice.amountPaid as number)}  |  Balance due ${money(invoice.balanceDue as number)}`,
                    PAGE_MARGIN, y, { width: contentWidth }
                );
                y += 24;
            }

            // ---------------------------------------------------------------- notes / payment / terms
            const textSection = (title: string, body?: string) => {
                if (!body || !body.trim()) return;
                doc.font('Helvetica').fontSize(9);
                const h = doc.heightOfString(body, { width: contentWidth }) + 26;
                if (y + h > bottomLimit()) {
                    doc.addPage();
                    y = PAGE_MARGIN;
                }
                doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(8).text(title.toUpperCase(), PAGE_MARGIN, y, { width: contentWidth, lineBreak: false });
                doc.fillColor(COLORS.text).font('Helvetica').fontSize(9).text(body, PAGE_MARGIN, y + 13, { width: contentWidth });
                y += h + 6;
            };
            textSection('Payment details', invoice.seller?.paymentInstructions);
            textSection('Notes', invoice.notes);
            textSection('Terms & conditions', invoice.terms);

            // ---------------------------------------------------------------- footer on every page
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                const oldBottom = doc.page.margins.bottom;
                doc.page.margins.bottom = 0; // otherwise writing near the bottom edge auto-adds a blank page
                doc.moveTo(PAGE_MARGIN, doc.page.height - 56).lineTo(pageWidth - PAGE_MARGIN, doc.page.height - 56).lineWidth(0.5).strokeColor(COLORS.line).stroke();
                doc.fillColor(COLORS.muted).font('Helvetica').fontSize(8)
                    .text(`${invoice.invoiceNumber}  |  This is a computer-generated invoice.`, PAGE_MARGIN, doc.page.height - 44, { width: contentWidth * 0.75, lineBreak: false });
                doc.text(`Page ${i - range.start + 1} of ${range.count}`, PAGE_MARGIN, doc.page.height - 44, { width: contentWidth, align: 'right', lineBreak: false });
                doc.page.margins.bottom = oldBottom;
            }

            doc.end();
        } catch (err) {
            reject(err);
        }
    });