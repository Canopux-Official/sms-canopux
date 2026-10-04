// project-sms/client/src/pages/admin/AdminBilling.tsx
//
// The institute's own read-only view of its plan, subscription history, and invoices —
// mirrors what the platform admin sees for this org, minus anything editable. Superadmin
// only (gated both here and server-side in billingController.ts).
import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert, Box, Chip, CircularProgress, IconButton, LinearProgress, Paper, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {
  downloadMyInvoicePdf, getBillingSummary, getMyInvoices,
  type BillingInvoice, type BillingSubscription,
} from '../../api/apiFunctions';

const money = (n: number, currency = 'INR') =>
  `${currency} ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function StatBox({ label, value, icon, accent, hint }: { label: string; value: ReactNode; icon: ReactNode; accent: string; hint?: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
      <Box sx={{ width: 44, height: 44, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${accent}1a`, color: accent, flexShrink: 0 }}>
        {icon}
      </Box>
      <Stack spacing={0.25} minWidth={0}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{label}</Typography>
        <Typography variant="h6" fontWeight={800} noWrap>{value}</Typography>
        {hint && <Typography variant="caption" color="text.secondary" noWrap>{hint}</Typography>}
      </Stack>
    </Paper>
  );
}

const STATE_COLOR: Record<BillingSubscription['state'], string> = {
  active: '#2e7d32', expiring_soon: '#c77700', expired: '#c62828', replaced: '#9e9e9e', cancelled: '#9e9e9e',
};
const STATE_LABEL: Record<BillingSubscription['state'], string> = {
  active: 'Active', expiring_soon: 'Expiring soon', expired: 'Expired', replaced: 'Replaced', cancelled: 'Cancelled',
};

const INVOICE_STATUS_COLOR: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  draft: 'default', issued: 'warning', paid: 'success', void: 'error',
};
const INVOICE_STATUS_LABEL: Record<string, string> = { draft: 'Draft', issued: 'Unpaid', paid: 'Paid', void: 'Void' };

export default function AdminBilling() {
  const summaryQuery = useQuery({ queryKey: ['billing-summary'], queryFn: getBillingSummary });
  const invoicesQuery = useQuery({ queryKey: ['billing-invoices'], queryFn: getMyInvoices });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const summary = summaryQuery.data?.success ? summaryQuery.data.data : null;
  const invoices: BillingInvoice[] = invoicesQuery.data?.success ? invoicesQuery.data.data || [] : [];

  const summaryError = !summaryQuery.isLoading && (!summaryQuery.data?.success ? summaryQuery.data?.message : null);

  const handleDownload = async (inv: BillingInvoice) => {
    setDownloadingId(inv.id);
    await downloadMyInvoicePdf(inv.id, inv.invoiceNumber);
    setDownloadingId(null);
  };

  if (summaryQuery.isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  if (summaryError) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Alert severity={summaryQuery.data?.status === 403 ? 'info' : 'error'}>
          {summaryQuery.data?.status === 403
            ? 'Billing details are only visible to the institute superadmin.'
            : summaryError}
        </Alert>
      </Box>
    );
  }

  if (!summary) return null;

  const current = summary.currentSubscription;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>Billing & Plan</Typography>
        <Typography variant="body2" color="text.secondary">Your subscription, invoices, and monthly usage</Typography>
      </Stack>

      <Stack spacing={3}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          <StatBox
            label="Students"
            value={current?.maxStudents != null ? `${current.maxStudents} limit` : 'Unlimited'}
            icon={<GroupIcon />} accent="#2f6fed"
          />
          <StatBox
            label="Days remaining"
            value={current ? current.daysRemaining : '—'}
            icon={<CalendarMonthIcon />}
            accent={current ? STATE_COLOR[current.state] : '#9e9e9e'}
            hint={current ? STATE_LABEL[current.state] : undefined}
          />
          <StatBox label="Invoiced (all time)" value={money(summary.invoiceSummary.totalInvoiced)} icon={<ReceiptLongIcon />} accent="#7b1fa2" />
          <StatBox
            label="Outstanding"
            value={money(summary.invoiceSummary.outstanding)}
            icon={<AccountBalanceWalletIcon />}
            accent={summary.invoiceSummary.outstanding > 0 ? '#c62828' : '#2e7d32'}
            hint={summary.invoiceSummary.overdueCount > 0 ? `${summary.invoiceSummary.overdueCount} overdue` : undefined}
          />
        </Box>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="overline" color="text.secondary">Current plan</Typography>
          {current ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="h6" fontWeight={800}>{current.planName}</Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                  <Typography variant="body2" fontWeight={700} sx={{ color: STATE_COLOR[current.state] }}>
                    {STATE_LABEL[current.state]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {current.state === 'expired' ? 'Ended' : `${current.daysRemaining} of ${current.totalDays} days left`}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={current.progressPercent}
                  sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: STATE_COLOR[current.state], borderRadius: 4 } }}
                />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">{new Date(current.startDate).toLocaleDateString()}</Typography>
                  <Typography variant="caption" color="text.secondary">{new Date(current.endDate).toLocaleDateString()}</Typography>
                </Stack>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Amount paid: {money(current.pricing.total, current.pricing.currency)}
              </Typography>
            </Stack>
          ) : (
            <Typography color="text.secondary" sx={{ mt: 1 }}>No active plan. Contact Canopux support to get set up.</Typography>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>Invoices</Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary' } }}>
                  <TableCell>Number</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Issue date</TableCell>
                  <TableCell>Due date</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Download</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoicesQuery.isLoading ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress size={22} /></TableCell></TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><Typography color="text.secondary">No invoices yet.</Typography></TableCell></TableRow>
                ) : (
                  invoices.map((inv) => (
                    <TableRow key={inv.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{inv.invoiceNumber}</TableCell>
                      <TableCell>
                        <Chip size="small" label={INVOICE_STATUS_LABEL[inv.status] || inv.status} color={INVOICE_STATUS_COLOR[inv.status] || 'default'} variant={inv.status === 'draft' ? 'outlined' : 'filled'} />
                      </TableCell>
                      <TableCell>{new Date(inv.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</TableCell>
                      <TableCell align="right">{money(inv.total, inv.currency)}</TableCell>
                      <TableCell align="right">
                        {downloadingId === inv.id ? (
                          <CircularProgress size={18} />
                        ) : (
                          <Tooltip title="Download PDF">
                            <IconButton size="small" onClick={() => handleDownload(inv)}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>Monthly summary</Typography>
            <Typography variant="body2" color="text.secondary">Plans active and amounts invoiced, most recent first</Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary' } }}>
                  <TableCell>Month</TableCell>
                  <TableCell>Plan(s)</TableCell>
                  <TableCell align="right">Invoiced</TableCell>
                  <TableCell align="right">Paid</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summary.monthly.map((row) => (
                  <TableRow key={row.month} hover selected={row.isCurrent}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight={row.isCurrent ? 700 : 400}>{row.label}</Typography>
                        {row.isCurrent && <Chip size="small" label="Current" color="primary" variant="outlined" />}
                      </Stack>
                    </TableCell>
                    <TableCell>{row.plans.length ? row.plans.join(', ') : '—'}</TableCell>
                    <TableCell align="right">{row.invoiced > 0 ? money(row.invoiced) : '—'}</TableCell>
                    <TableCell align="right">{row.paid > 0 ? money(row.paid) : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>
    </Box>
  );
}