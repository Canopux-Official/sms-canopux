import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack,
  TextField, Typography,
} from '@mui/material';
import { recordBulkPayment, type InvoiceSummary } from '../api/platformApiFunctions';

interface BulkPaymentDialogProps {
  open: boolean;
  /** The ledger lines the admin ticked. Each one is settled for its full remaining balance. */
  invoices: InvoiceSummary[];
  onClose: () => void;
  /** Called after the payments are saved so the page can refresh its numbers. */
  onDone: () => Promise<void> | void;
}

const money = (n: number, currency = 'INR') =>
  `${currency} ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);

const chargeLabel = (inv: InvoiceSummary) =>
  inv.installment
    ? inv.installment.kind === 'one_time' ? 'One-time fee' : `Month ${inv.installment.sequence}`
    : inv.invoiceNumber;

export default function BulkPaymentDialog({ open, invoices, onClose, onDone }: BulkPaymentDialogProps) {
  const [paidAt, setPaidAt] = useState(today());
  const [method, setMethod] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
  }, [open]);

  const currency = invoices[0]?.currency || 'INR';
  const total = invoices.reduce((a, i) => a + i.balanceDue, 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (invoices.length === 0) return;
    setError(null);
    setBusy(true);
    const result = await recordBulkPayment({
      invoiceIds: invoices.map((i) => i.id),
      paidAt: paidAt || undefined,
      paymentMethod: method.trim() || undefined,
      paymentReference: reference.trim() || undefined,
      note: note.trim() || undefined,
    });
    if (result.success) {
      await onDone();
      onClose();
    } else {
      setError(result.message || 'Failed to record payments');
    }
    setBusy(false);
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Record payment for {invoices.length} charge{invoices.length === 1 ? '' : 's'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5}>
            {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

            <Stack spacing={0.75}>
              {invoices.map((inv) => (
                <Stack key={inv.id} direction="row" justifyContent="space-between">
                  <Typography variant="body2">
                    {chargeLabel(inv)}
                    <Typography component="span" variant="caption" color="text.secondary"> · {inv.invoiceNumber}</Typography>
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>{money(inv.balanceDue, inv.currency)}</Typography>
                </Stack>
              ))}
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={700}>Total received</Typography>
                <Typography fontWeight={800} color="success.main">{money(total, currency)}</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Each selected charge is marked paid in full. For a part payment on a single charge, use that row's Payment button.
              </Typography>
            </Stack>

            <Divider />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Payment date" type="date" fullWidth value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField label="Method (UPI, Bank transfer…)" value={method} onChange={(e) => setMethod(e.target.value)} fullWidth />
            </Stack>
            <TextField label="Reference / transaction ID" value={reference} onChange={(e) => setReference(e.target.value)} fullWidth />
            <TextField label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3, pb: 2.5, pt: 2,
            position: 'sticky', bottom: 0, bgcolor: 'background.paper',
            borderTop: '1px solid', borderColor: 'divider', zIndex: 1,
          }}
        >
          <Button onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" variant="contained" color="success" disabled={busy || invoices.length === 0}>
            {busy ? <CircularProgress size={20} color="inherit" /> : `Record ${money(total, currency)}`}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}