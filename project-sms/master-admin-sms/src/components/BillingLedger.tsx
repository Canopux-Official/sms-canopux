import { useMemo, useState } from 'react';
import {
  Box, Button, Checkbox, Chip, CircularProgress, IconButton, LinearProgress, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PaidIcon from '@mui/icons-material/Paid';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { InvoiceSummary, SubscriptionSummary } from '../api/platformApiFunctions';
import BulkPaymentDialog from './BulkPaymentDialog';
import VoidChargeDialog from './VoidChargeDialog';

interface BillingLedgerProps {
  subscriptions: SubscriptionSummary[]; // newest first
  invoices: InvoiceSummary[];
  /** Invoice currently being downloaded (shows a spinner instead of its download button). */
  busyInvoiceId: string | null;
  /** Downloads the invoice PDF directly. */
  onDownload: (invoice: InvoiceSummary) => void;
  /** Refresh the page's numbers after something changed. */
  onChanged: () => Promise<void> | void;
  /** Called when a ledger action gets a 401 so the page can log out. */
  onSessionExpired?: () => void;
}

const money = (n: number | undefined | null, currency = 'INR') =>
  `${currency} ${(n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const shortDate = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// --- due-date classification (mirrors the server: whole UTC days) ---
const DAY_MS = 24 * 60 * 60 * 1000;
const todayStartUTC = () => {
  const n = new Date();
  return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
};

type LineState = 'paid' | 'partial' | 'overdue' | 'due' | 'upcoming' | 'void' | 'draft';

const lineState = (inv: InvoiceSummary): LineState => {
  if (inv.status === 'void') return 'void';
  if (inv.status === 'draft') return 'draft';
  if (inv.status === 'paid') return 'paid';
  const due = inv.dueDate ? new Date(inv.dueDate).getTime() : 0;
  const start = todayStartUTC();
  if (inv.amountPaid > 0) return 'partial';
  if (due < start) return 'overdue';
  if (due < start + DAY_MS) return 'due';
  return 'upcoming';
};

const isPastDue = (inv: InvoiceSummary) => (inv.dueDate ? new Date(inv.dueDate).getTime() : 0) < todayStartUTC() + DAY_MS;

function StateChip({ inv }: { inv: InvoiceSummary }) {
  const state = lineState(inv);
  const overduePartial = state === 'partial' && inv.dueDate && new Date(inv.dueDate).getTime() < todayStartUTC();
  const chip = (() => {
    switch (state) {
      case 'paid': return <Chip size="small" label="Paid" color="success" />;
      case 'partial': return <Chip size="small" label={overduePartial ? 'Part paid · overdue' : 'Partially paid'} color={overduePartial ? 'error' : 'warning'} />;
      case 'overdue': return <Chip size="small" label="Overdue" color="error" />;
      case 'due': return <Chip size="small" label="Due now" color="warning" />;
      case 'upcoming': return <Chip size="small" label="Upcoming" variant="outlined" />;
      case 'void': return <Chip size="small" label="Void" variant="outlined" color="default" sx={{ textDecoration: 'line-through' }} />;
      default: return <Chip size="small" label="Draft" variant="outlined" />;
    }
  })();
  return state === 'void' && inv.voidReason ? <Tooltip title={inv.voidReason}>{chip}</Tooltip> : chip;
}

const chargeTitle = (inv: InvoiceSummary, unlinked: boolean) => {
  if (inv.installment) return inv.installment.kind === 'one_time' ? 'One-time fee' : `Monthly maintenance`;
  return unlinked ? 'Manual invoice' : 'Plan invoice';
};
const chargeSub = (inv: InvoiceSummary) => (inv.installment && inv.installment.kind === 'maintenance' ? inv.installment.label : '');

const sortLines = (a: InvoiceSummary, b: InvoiceSummary) => {
  const sa = a.installment ? a.installment.sequence : 9999;
  const sb = b.installment ? b.installment.sequence : 9999;
  if (sa !== sb) return sa - sb;
  return new Date(a.dueDate || a.issueDate).getTime() - new Date(b.dueDate || b.issueDate).getTime();
};

// Ledger order: month by month (the one-time fee and month 1 are both due on day one).
const sortByDueThenSequence = (a: InvoiceSummary, b: InvoiceSummary) => {
  const da = new Date(a.dueDate || a.issueDate).getTime();
  const db = new Date(b.dueDate || b.issueDate).getTime();
  return da !== db ? da - db : sortLines(a, b);
};

export default function BillingLedger({ subscriptions, invoices, busyInvoiceId, onDownload, onChanged, onSessionExpired }: BillingLedgerProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [voidTarget, setVoidTarget] = useState<InvoiceSummary | null>(null);

  const groups = useMemo(() => {
    const subIds = new Set(subscriptions.map((s) => s.id));
    const list = subscriptions.map((s) => ({
      key: s.id,
      subscription: s as SubscriptionSummary | null,
      lines: invoices.filter((i) => i.subscriptionId === s.id).sort(sortByDueThenSequence),
    }));
    const others = invoices.filter((i) => !i.subscriptionId || !subIds.has(i.subscriptionId)).sort(sortByDueThenSequence);
    if (others.length) list.push({ key: 'other', subscription: null, lines: others });
    return list;
  }, [subscriptions, invoices]);

  // Only unpaid, issued charges can be ticked. Always read from the latest invoices so numbers stay fresh.
  const payable = (i: InvoiceSummary) => i.status === 'issued' && i.balanceDue > 0;
  const selected = invoices.filter((i) => selectedIds.has(i.id) && payable(i)).sort(sortByDueThenSequence);
  const selectedTotal = selected.reduce((a, i) => a + i.balanceDue, 0);

  const toggle = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const addMany = (list: InvoiceSummary[]) => setSelectedIds((prev) => new Set([...prev, ...list.map((i) => i.id)]));

  if (groups.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No plan purchases yet.</Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap spacing={1}>
        <Stack spacing={0.25}>
          <Typography variant="subtitle1" fontWeight={700}>Billing ledger</Typography>
          <Typography variant="caption" color="text.secondary">
            The one-time fee is due on the start date; each month's maintenance is billed in advance on its first day.
            Tick the charges an institute has paid and record them together. Use the download button on a row to get its invoice,
            or the void button to waive / remove a charge (totals update automatically).
          </Typography>
        </Stack>
        {selected.length > 0 && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" fontWeight={600}>{selected.length} selected · {money(selectedTotal, selected[0].currency)}</Typography>
            <Button size="small" variant="contained" color="success" startIcon={<PaidIcon fontSize="small" />} onClick={() => setBulkOpen(true)}>
              Record payment
            </Button>
            <Button size="small" onClick={() => setSelectedIds(new Set())}>Clear</Button>
          </Stack>
        )}
      </Stack>

      {groups.map((g) => {
        const s = g.subscription;
        const live = g.lines.filter((i) => i.status === 'issued' || i.status === 'paid');
        const billed = live.reduce((a, i) => a + i.total, 0);
        const paid = live.reduce((a, i) => a + i.amountPaid, 0);
        const currency = s?.pricing.currency || g.lines[0]?.currency || 'INR';
        const unpaidLines = g.lines.filter(payable);
        const dueLines = unpaidLines.filter(isPastDue);

        return (
          <Paper key={g.key} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" useFlexGap spacing={1}>
                <Stack spacing={0.25}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight={800}>{s ? s.planName : 'Other invoices'}</Typography>
                    {s && (
                      <Chip
                        size="small"
                        label={s.state.replace('_', ' ')}
                        color={s.state === 'active' ? 'success' : s.state === 'expiring_soon' ? 'warning' : s.state === 'expired' ? 'error' : 'default'}
                        variant={s.state === 'replaced' || s.state === 'cancelled' ? 'outlined' : 'filled'}
                      />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {s ? `${shortDate(s.startDate)} – ${shortDate(s.endDate)}` : 'Manual / unlinked invoices'}
                    {s && s.state === 'replaced' ? ' · replaced by a newer plan — unpaid charges below are still owed' : ''}
                  </Typography>
                </Stack>
                <Stack alignItems="flex-end" spacing={0.25} sx={{ minWidth: 220 }}>
                  <Typography variant="body2">
                    <b>{money(paid, currency)}</b> paid of {money(billed, currency)}
                  </Typography>
                  <LinearProgress
                    variant="determinate" color="success" sx={{ width: '100%', height: 6, borderRadius: 3 }}
                    value={billed > 0 ? Math.min(100, (paid / billed) * 100) : 0}
                  />
                  <Typography variant="caption" color={billed - paid > 0.005 ? 'error.main' : 'success.main'}>
                    {billed - paid > 0.005 ? `${money(billed - paid, currency)} balance` : 'Fully paid'}
                  </Typography>
                </Stack>
              </Stack>
              {unpaidLines.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  {dueLines.length > 0 && (
                    <Button size="small" onClick={() => addMany(dueLines)}>Select due now ({dueLines.length})</Button>
                  )}
                  <Button size="small" onClick={() => addMany(unpaidLines)}>Select all unpaid ({unpaidLines.length})</Button>
                </Stack>
              )}
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary', whiteSpace: 'nowrap' } }}>
                    <TableCell padding="checkbox" />
                    <TableCell>Charge</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Due</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Paid</TableCell>
                    <TableCell align="right">Balance</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Download</TableCell>
                    <TableCell align="center">Void</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {g.lines.length === 0 ? (
                    <TableRow><TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">No charges were generated for this purchase.</Typography>
                    </TableCell></TableRow>
                  ) : (
                    g.lines.map((inv) => {
                      const state = lineState(inv);
                      const isVoid = state === 'void';
                      const counted = inv.status === 'issued' || inv.status === 'paid';
                      return (
                        <TableRow key={inv.id} hover sx={{ opacity: isVoid ? 0.55 : 1 }}>
                          <TableCell padding="checkbox">
                            <Checkbox size="small" disabled={!payable(inv)} checked={selectedIds.has(inv.id) && payable(inv)} onChange={() => toggle(inv.id)} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{chargeTitle(inv, !s)}</Typography>
                            {chargeSub(inv) && <Typography variant="caption" color="text.secondary">{chargeSub(inv)}</Typography>}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {inv.installment?.kind === 'one_time' || !inv.periodStart ? '—' : `${shortDate(inv.periodStart)} – ${shortDate(inv.periodEnd)}`}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{shortDate(inv.dueDate)}</TableCell>
                          <TableCell align="right" sx={{ textDecoration: isVoid ? 'line-through' : 'none' }}>{money(inv.total, inv.currency)}</TableCell>
                          <TableCell align="right">{counted ? money(inv.amountPaid, inv.currency) : '—'}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: counted && inv.balanceDue > 0 ? 'error.main' : 'text.primary' }}>
                            {counted ? money(inv.balanceDue, inv.currency) : '—'}
                          </TableCell>
                          <TableCell><StateChip inv={inv} /></TableCell>
                          <TableCell align="center">
                            {busyInvoiceId === inv.id ? (
                              <CircularProgress size={18} />
                            ) : (
                              <Tooltip title={`Download invoice ${inv.invoiceNumber}`}>
                                <IconButton size="small" color="primary" onClick={() => onDownload(inv)} aria-label="Download invoice">
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {isVoid ? (
                              <Typography variant="caption" color="text.disabled">—</Typography>
                            ) : (
                              <Tooltip title="Void this charge (removes it from the bill)">
                                <IconButton size="small" color="error" onClick={() => setVoidTarget(inv)} aria-label="Void charge">
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        );
      })}

      <BulkPaymentDialog
        open={bulkOpen}
        invoices={selected}
        onClose={() => setBulkOpen(false)}
        onDone={async () => {
          setSelectedIds(new Set());
          await onChanged();
        }}
      />

      <VoidChargeDialog
        open={voidTarget !== null}
        invoice={voidTarget}
        onClose={() => setVoidTarget(null)}
        onSessionExpired={onSessionExpired}
        onDone={async () => {
          // A voided line can no longer be ticked for payment.
          setSelectedIds(new Set());
          await onChanged();
        }}
      />
    </Stack>
  );
}