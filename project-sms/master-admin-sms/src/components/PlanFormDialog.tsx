import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  FormControlLabel, InputAdornment, Stack, Switch, TextField, Typography,
} from '@mui/material';
import { createPlan, updatePlan, type PlanFormInput, type PlanSummary } from '../api/platformApiFunctions';

interface PlanFormDialogProps {
  open: boolean;
  plan: PlanSummary | null; // null = create mode
  onClose: () => void;
  onSaved: () => void;
}

const emptyForm = (): PlanFormInput => ({
  name: '',
  description: '',
  minStudents: 0,
  maxStudents: 100,
  durationDays: 30,
  price: 0,
  monthlyMaintenance: 0,
  currency: 'INR',
});

export default function PlanFormDialog({ open, plan, onClose, onSaved }: PlanFormDialogProps) {
  const [form, setForm] = useState<PlanFormInput>(emptyForm());
  const [unlimited, setUnlimited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (plan) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- populating the form from the plan on open
      setForm({
        name: plan.name,
        description: plan.description,
        minStudents: plan.minStudents,
        maxStudents: plan.maxStudents,
        durationDays: plan.durationDays,
        price: plan.oneTimePrice,
        monthlyMaintenance: plan.monthlyMaintenance,
        currency: plan.currency,
      });
      setUnlimited(plan.maxStudents === null);
    } else {
      setForm(emptyForm());
      setUnlimited(false);
    }
    setError(null);
  }, [open, plan]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.name.trim().length < 2) return setError('Plan name must be at least 2 characters');
    if (!unlimited && (form.maxStudents === null || form.maxStudents < 1)) return setError('Enter a student limit, or mark this plan as unlimited');
    if (!(form.price >= 0) || !(form.monthlyMaintenance >= 0)) return setError('Fees cannot be negative');

    setSaving(true);
    const payload: PlanFormInput = { ...form, maxStudents: unlimited ? null : form.maxStudents };
    const result = plan ? await updatePlan(plan.id, payload) : await createPlan(payload);
    setSaving(false);

    if (result.success) {
      onSaved();
    } else {
      setError(result.message || 'Failed to save plan');
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{plan ? `Edit "${plan.name}"` : 'New Plan'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}
            {plan && (
              <Alert severity="info" variant="outlined">
                Editing this plan only changes future assignments — institutes already on it keep their
                purchased terms untouched (each purchase snapshots the plan at the time).
              </Alert>
            )}

            <TextField label="Plan name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required fullWidth autoFocus />
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline minRows={2} />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Min students" type="number" value={form.minStudents} fullWidth
                onChange={(e) => setForm({ ...form, minStudents: Number(e.target.value) })}
                slotProps={{ htmlInput: { min: 0 } }}
              />
              <TextField
                label="Max students" type="number" value={unlimited ? '' : form.maxStudents ?? ''} fullWidth
                disabled={unlimited}
                onChange={(e) => setForm({ ...form, maxStudents: e.target.value === '' ? null : Number(e.target.value) })}
                slotProps={{ htmlInput: { min: 1 } }}
              />
            </Stack>
            <FormControlLabel
              control={<Switch checked={unlimited} onChange={(e) => setUnlimited(e.target.checked)} />}
              label="Unlimited students"
            />

            <Divider />
            <Typography variant="subtitle2" fontWeight={700}>Duration & Pricing</Typography>

            <TextField
              label="Duration (days)" type="number" value={form.durationDays} fullWidth
              onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
              helperText="How long the plan runs. 30 = 1 month, 365 = about 12 months of maintenance"
              slotProps={{ htmlInput: { min: 1 } }}
            />

            <TextField
              label="One-time fee" type="number" value={form.price} fullWidth
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              helperText="Charged once, when the plan is assigned to an institute"
              slotProps={{ input: { startAdornment: <InputAdornment position="start">{form.currency}</InputAdornment> }, htmlInput: { min: 0, step: '0.01' } }}
            />

            <TextField
              label="Monthly maintenance charge" type="number" value={form.monthlyMaintenance} fullWidth
              onChange={(e) => setForm({ ...form, monthlyMaintenance: Number(e.target.value) })}
              helperText="Fixed amount billed for every month of the duration"
              slotProps={{ input: { startAdornment: <InputAdornment position="start">{form.currency}</InputAdornment> }, htmlInput: { min: 0, step: '0.01' } }}
            />
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
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : plan ? 'Save changes' : 'Create plan'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}