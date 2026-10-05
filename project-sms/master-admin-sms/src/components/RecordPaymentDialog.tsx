import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton,
  Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  deleteInvoicePayment, markInvoiceUnpaid, recordInvoicePayment, type InvoiceSummary,
} from '../api/platformApiFunctions';
import InvoiceStatusChip from './InvoiceStatusChip';

interface RecordPaymentDialogProps {
  open: boolean;
  /** Always pass the freshest copy of the invoice so totals update the moment a payment is saved. */
  invoice: InvoiceSummary | null;
  onClose: () => void;
  /** Called after every change (add / remove / clear) so the page can refresh its numbers. */
  onChanged: () => Promise<void> | void;
}

const money = (n: number | undefined | null, currency = 'INR') =>
  `${currency} ${(n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const today = () => new Date().toISOString().slice(0, 10);

export default function RecordPaymentDialog({ open, invoice, onClose, onChanged }: RecordPaymentDialogProps) {
  const [amount, setAmount] = useState<number | ''>('');
  const [paidAt, setPaidAt] = useState(today());
  const [method, setMethod] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const balance = invoice?.balanceDue ?? 0;
  const invoiceId = invoice?.id;

  // Reset the form when the dialog opens for an invoice.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- resetting form state on dialog open */
    if (open) {
      setPaidAt(today());
      setMethod('');
      setReference('');
      setNote('');
      setError(null);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, invoiceId]);

  // Default the amount to whatever is still owed; follows the balance as payments change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- derived default
    if (open) setAmount(balance > 0 ? balance : '');
  }, [open, balance]);

  if (!invoice) return null;
  const cur = invoice.currency;
  const fullyPaid = invoice.status === 'paid';
  const canPay = (invoice.status === 'issued' || invoice.status === 'draft') && balance > 0;
  const hasAnyPayment = invoice.amountPaid > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (amount === '' || !(Number(amount) > 0)) return setError('Enter an amount greater than 0');
    if (Number(amount) > balance + 0.005) return setError(`Amount cannot be more than the balance due (${money(balance, cur)})`);
    setError(null);
    setBusy(true);
    const result = await recordInvoicePayment(invoice.id, {
      amount: Number(amount),
      paidAt: paidAt || undefined,
      paymentMethod: method.trim() || undefined,
      paymentReference: reference.trim() || undefined,
      note: note.trim() || undefined,
    });
    if (result.success) {
      await onChanged();
      setMethod('');
      setReference('');
      setNote('');
    } else {
      setError(result.message || 'Failed to record payment');
    }
    setBusy(false);
  };

  const handleRemove = async (paymentId: string) => {
    setBusy(true);
    setError(null);
    const result = await deleteInvoicePayment(invoice.id, paymentId);
    if (result.success) await onChanged();
    else setError(result.message || 'Failed to remove payment');
    setBusy(false);
  };

  const handleMarkUnpaid = async () => {
    setBusy(true);
    setError(null);
    const result = await markInvoiceUnpaid(invoice.id);
    if (result.success) await onChanged();
    else setError(result.message || 'Failed to mark unpaid');
    setBusy(false);
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <span>Payment — {invoice.invoiceNumber}</span>
          <InvoiceStatusChip status={invoice.status} partiallyPaid={hasAnyPayment && invoice.status === 'issued'} />
        </Stack>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5}>
            {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">Invoice total</Typography>
                <Typography fontWeight={700}>{money(invoice.total, cur)}</Typography>
              </Stack>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">Paid so far</Typography>
                <Typography fontWeight={700} color="success.main">{money(invoice.amountPaid, cur)}</Typography>
              </Stack>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">Balance due</Typography>
                <Typography fontWeight={700} color={balance > 0 ? 'error.main' : 'success.main'}>{money(balance, cur)}</Typography>
              </Stack>
            </Box>

            {invoice.payments.length > 0 && (
              <>
                <Divider />
                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight={700}>Payments received</Typography>
                  {invoice.payments.map((p) => (
                    <Stack key={p.id} direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                      <Stack spacing={0}>
                        <Typography variant="body2" fontWeight={600}>
                          {money(p.amount, cur)} · {new Date(p.paidAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {[p.method, p.reference && `ref ${p.reference}`, p.note].filter(Boolean).join(' · ') || 'No details'}
                        </Typography>
                      </Stack>
                      <Tooltip title="Remove this payment">
                        <span>
                          <IconButton size="small" color="error" disabled={busy} onClick={() => handleRemove(p.id)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  ))}
                </Stack>
              </>
            )}

            {fullyPaid && invoice.payments.length === 0 && (
              <Alert severity="info">
                This invoice was marked paid before individual payments were tracked. Use "Mark unpaid" below if that needs correcting.
              </Alert>
            )}

            {canPay ? (
              <>
                <Divider />
                <Typography variant="subtitle2" fontWeight={700}>
                  {hasAnyPayment ? 'Record another payment' : 'Record a payment'}
                </Typography>
                {invoice.status === 'draft' && (
                  <Alert severity="info">This invoice is still a draft. Recording a payment will issue it.</Alert>
                )}
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Amount" type="number" fullWidth value={amount} required
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    helperText="Defaults to the full balance; lower it for a part payment"
                    slotProps={{ htmlInput: { min: 0.01, step: '0.01', max: balance } }}
                  />
                  <TextField
                    label="Payment date" type="date" fullWidth value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField label="Method (UPI, Bank transfer…)" value={method} onChange={(e) => setMethod(e.target.value)} fullWidth />
                  <TextField label="Reference / transaction ID" value={reference} onChange={(e) => setReference(e.target.value)} fullWidth />
                </Stack>
                <TextField label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} fullWidth />
              </>
            ) : (
              invoice.status === 'void' && <Alert severity="warning">This invoice is void and cannot take payments.</Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3, pb: 2.5, pt: 2, justifyContent: 'space-between',
            position: 'sticky', bottom: 0, bgcolor: 'background.paper',
            borderTop: '1px solid', borderColor: 'divider', zIndex: 1,
          }}
        >
          <Box>
            {(hasAnyPayment || fullyPaid) && invoice.status !== 'void' && (
              <Button color="error" onClick={handleMarkUnpaid} disabled={busy}>Mark unpaid</Button>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose} disabled={busy}>Close</Button>
            {canPay && (
              <Button type="submit" variant="contained" color="success" disabled={busy}>
                {busy ? <CircularProgress size={20} color="inherit" /> : 'Record payment'}
              </Button>
            )}
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
}