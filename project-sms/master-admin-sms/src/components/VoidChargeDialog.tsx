import { useEffect, useState } from 'react';
import {
  Alert, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel,
  Stack, TextField, Typography,
} from '@mui/material';
import { voidInvoice, type InvoiceSummary } from '../api/platformApiFunctions';

interface VoidChargeDialogProps {
  open: boolean;
  /** The ledger line the admin chose to void (null while closed). */
  invoice: InvoiceSummary | null;
  onClose: () => void;
  /** Called after the charge is voided so the page can refresh every figure from the server. */
  onDone: () => Promise<void> | void;
  /** Called when the server answers 401 so the page can log out. */
  onSessionExpired?: () => void;
}

const money = (n: number, currency = 'INR') =>
  `${currency} ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const chargeLabel = (inv: InvoiceSummary) =>
  inv.installment
    ? inv.installment.kind === 'one_time' ? 'One-time fee' : `Monthly maintenance (${inv.installment.label})`
    : inv.invoiceNumber;

export default function VoidChargeDialog({ open, invoice, onClose, onDone, onSessionExpired }: VoidChargeDialogProps) {
  const [reason, setReason] = useState('');
  const [discardPayments, setDiscardPayments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- resetting form state on dialog open */
    if (open) {
      setReason('');
      setDiscardPayments(false);
      setError(null);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, invoice?.id]);

  if (!invoice) return null;

  const hasPayments = invoice.amountPaid > 0;
  const canSubmit = !busy && (!hasPayments || discardPayments);

  const handleConfirm = async () => {
    setError(null);
    setBusy(true);
    const result = await voidInvoice(invoice.id, {
      reason: reason.trim() || undefined,
      discardPayments: hasPayments ? discardPayments : undefined,
    });
    if (result.success) {
      await onDone();
      setBusy(false);
      onClose();
      return;
    }
    setBusy(false);
    if (result.status === 401) {
      onSessionExpired?.();
      return;
    }
    setError(result.message || 'Failed to void this charge');
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Void this charge?</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

          <Stack spacing={0.25}>
            <Typography fontWeight={700}>{chargeLabel(invoice)}</Typography>
            <Typography variant="caption" color="text.secondary">
              {invoice.invoiceNumber} · {money(invoice.total, invoice.currency)}
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            The charge is removed from this institute's bill. Total invoiced and the amount due drop by{' '}
            <b>{money(invoice.total, invoice.currency)}</b>, and the plan amount is reduced to match. This cannot be undone.
          </Typography>

          {hasPayments && (
            <Alert severity="warning">
              {money(invoice.amountPaid, invoice.currency)} was already recorded as paid on this charge. Voiding it also
              removes that payment, so the Paid total goes down by the same amount.
              <FormControlLabel
                sx={{ display: 'block', mt: 0.5 }}
                control={<Checkbox size="small" checked={discardPayments} onChange={(e) => setDiscardPayments(e.target.checked)} />}
                label="Yes, void it together with its payment"
              />
            </Alert>
          )}

          <TextField
            label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value.slice(0, 300))}
            placeholder="e.g. Maintenance waived for this month" fullWidth multiline minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={handleConfirm} color="error" variant="contained" disabled={!canSubmit}>
          {busy ? <CircularProgress size={20} color="inherit" /> : 'Void charge'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
