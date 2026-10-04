import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, MenuItem, Stack, Switch, TextField, Typography, Box,
} from '@mui/material';
import { assignPlanToOrganization, getPlans, type AssignPlanResult, type PlanSummary } from '../api/platformApiFunctions';

interface AssignPlanDialogProps {
  open: boolean;
  organizationId: string;
  organizationName: string;
  hasActiveSubscription: boolean;
  /** Name of the plan being replaced, shown in the warning. */
  currentPlanName?: string;
  onClose: () => void;
  onAssigned: (result: AssignPlanResult) => void;
}

export default function AssignPlanDialog({ open, organizationId, organizationName, hasActiveSubscription, currentPlanName, onClose, onAssigned }: AssignPlanDialogProps) {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [planId, setPlanId] = useState('');

  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [notes, setNotes] = useState('');
  const [carryOver, setCarryOver] = useState(false);
  const [createInvoice, setCreateInvoice] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting form state on dialog open
    setError(null);
    setSaving(false);
    setDiscountPercent(0);
    setTaxPercent(0);
    setNotes('');
    setCarryOver(false);
    setCreateInvoice(true);

    (async () => {
      setPlansLoading(true);
      const result = await getPlans();
      if (result.success && result.data) {
        setPlans(result.data);
        if (result.data.length > 0) setPlanId(result.data[0].id);
      }
      setPlansLoading(false);
    })();
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!planId) return setError('Select a plan');

    setSaving(true);
    const result = await assignPlanToOrganization(organizationId, {
      planId,
      discountPercent: discountPercent || undefined,
      taxPercent: taxPercent || undefined,
      notes: notes.trim() || undefined,
      carryOverRemainingDays: carryOver,
      createInvoice,
    });
    setSaving(false);

    if (result.success && result.data) {
      onAssigned(result.data);
    } else {
      setError(result.message || 'Failed to assign plan');
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign a plan to {organizationName}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}
            {hasActiveSubscription && (
              <Alert severity="warning" variant="outlined">
                This institute is currently on <b>{currentPlanName || 'a plan'}</b>. Assigning a new plan replaces it from today
                (or the start date you choose below):
                <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                  <li>Charges the old plan already billed stay as they are — paid, or still owed.</li>
                  <li>The old plan's later, unpaid months are cancelled.</li>
                  <li>Anything already paid in advance for those months moves onto the new plan.</li>
                  <li>The new plan bills its own one-time fee and months from the start date, exactly as defined in the plan.</li>
                </ul>
              </Alert>
            )}

            <TextField
              select label="Plan" value={planId} fullWidth required disabled={plansLoading}
              onChange={(e) => setPlanId(e.target.value)}
            >
              {plans.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} — {p.maxStudents === null ? 'unlimited' : `up to ${p.maxStudents}`} students, {p.durationDays}d, {p.currency} {p.oneTimePrice} one-time + {p.monthlyMaintenance}/mo
                </MenuItem>
              ))}
            </TextField>

            {hasActiveSubscription && (
              <FormControlLabel
                control={<Switch checked={carryOver} onChange={(e) => setCarryOver(e.target.checked)} />}
                label="Add remaining days from the current plan on top of this one"
              />
            )}

            <Stack direction="row" spacing={2}>
              <TextField
                label="Discount %" type="number" fullWidth value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))} slotProps={{ htmlInput: { min: 0, max: 100 } }}
              />
              <TextField
                label="Tax %" type="number" fullWidth value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))} slotProps={{ htmlInput: { min: 0, max: 100 } }}
              />
            </Stack>

            <TextField label="Internal notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth multiline minRows={2} />

            <FormControlLabel
              control={<Switch checked={createInvoice} onChange={(e) => setCreateInvoice(e.target.checked)} />}
              label="Create the billing schedule (invoices) for this purchase"
            />
            <Typography variant="caption" color="text.secondary">
              One invoice for the one-time fee (due on the start date) plus one per month, billed in advance. They appear in the ledger, where you record each payment; any invoice can still be edited.</Typography>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3, pb: 2.5, pt: 2,
            position: 'sticky', bottom: 0, bgcolor: 'background.paper',
            borderTop: '1px solid', borderColor: 'divider', zIndex: 1,
          }}
        >
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving || plansLoading}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Assign plan'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}