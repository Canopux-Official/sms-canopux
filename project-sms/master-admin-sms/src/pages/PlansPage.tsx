import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Button, CircularProgress, Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { deletePlan, getPlans, type PlanSummary } from '../api/platformApiFunctions';
import { usePlatformAuth } from '../context/PlatformAuthContext';
import AppShell from '../components/AppShell';
import PlanFormDialog from '../components/PlanFormDialog';
import ConfirmDialog from '../components/ConfirmDialog';

const money = (n: number | undefined | null, currency = 'INR') => `${currency} ${(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function PlansPage() {
  const { logout } = usePlatformAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanSummary | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<PlanSummary | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // If the API is still running the previous build, plans arrive without the new fee fields.
  const serverOutdated = plans.some((p) => p.oneTimePrice === undefined || p.monthlyMaintenance === undefined);

  const handleSessionExpired = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getPlans();
    if (result.success && result.data) {
      setPlans(result.data);
    } else if (result.status === 401) {
      handleSessionExpired();
      return;
    } else {
      setError(result.message || 'Failed to load plans');
    }
    setLoading(false);
  }, [handleSessionExpired]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPlans();
  }, [loadPlans]);

  const openCreate = () => { setEditingPlan(null); setDialogOpen(true); };
  const openEdit = (plan: PlanSummary) => { setEditingPlan(plan); setDialogOpen(true); };

  const handleSaved = () => {
    setDialogOpen(false);
    loadPlans();
  };

  const handleDelete = async () => {
    if (!deletingPlan) return;
    setDeleteLoading(true);
    const result = await deletePlan(deletingPlan.id);
    setDeleteLoading(false);
    if (result.success) {
      setDeletingPlan(null);
      loadPlans();
    } else if (result.status === 401) {
      handleSessionExpired();
    } else {
      setDeletingPlan(null);
      setError(result.message || 'Failed to delete plan');
      loadPlans(); // the institute count may have changed since the page loaded
    }
  };

  return (
    <AppShell
      title="Plans"
      subtitle="Reusable templates you assign to institutes"
      actions={
        <>
          <Button startIcon={<RefreshIcon />} onClick={loadPlans} disabled={loading}>Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New Plan</Button>
        </>
      }
    >
      <Stack spacing={3}>
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        {serverOutdated && (
          <Alert severity="warning">
            The server is still running the previous version (plans are missing the one-time fee / monthly maintenance
            fields). Update the server files and restart it, otherwise fees will show as 0 and new plans won't save correctly.
          </Alert>
        )}

        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 700, fontSize: 12.5, letterSpacing: 0.3, textTransform: 'uppercase', color: 'text.secondary' } }}>
                  <TableCell>Plan</TableCell>
                  <TableCell>Students</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>One-time fee</TableCell>
                  <TableCell>Monthly maintenance</TableCell>
                  <TableCell>Institutes</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}><CircularProgress size={28} /></TableCell></TableRow>
                ) : plans.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No plans yet — create the first one.</Typography>
                  </TableCell></TableRow>
                ) : (
                  plans.map((plan) => (
                    <TableRow key={plan.id} hover>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography fontWeight={600}>{plan.name}</Typography>
                          {plan.description && (
                            <Typography variant="caption" color="text.secondary">{plan.description}</Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>{plan.maxStudents === null ? 'Unlimited' : `up to ${plan.maxStudents}`}</TableCell>
                      <TableCell>{plan.durationDays === 30 ? 'Monthly' : plan.durationDays === 365 ? 'Yearly' : `${plan.durationDays} days`}</TableCell>
                      <TableCell>{money(plan.oneTimePrice, plan.currency)}</TableCell>
                      <TableCell>{money(plan.monthlyMaintenance, plan.currency)} / month</TableCell>
                      <TableCell>{plan.organizationsCount ?? 0}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={() => openEdit(plan)}>
                            Edit
                          </Button>
                          <Tooltip
                            title={
                              (plan.organizationsCount ?? 0) > 0
                                ? `Can't delete — ${plan.organizationsCount} institute${plan.organizationsCount === 1 ? ' is' : 's are'} on this plan`
                                : 'Delete this plan'
                            }
                          >
                            <span>
                              <Button
                                size="small" color="error" startIcon={<DeleteOutlineIcon fontSize="small" />}
                                disabled={(plan.organizationsCount ?? 0) > 0}
                                onClick={() => setDeletingPlan(plan)}
                              >
                                Delete
                              </Button>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>

      <ConfirmDialog
        open={Boolean(deletingPlan)}
        title={`Delete "${deletingPlan?.name}"?`}
        description="This permanently removes the plan template. Institutes' past purchases and invoices are not affected, because they keep their own copy of the plan."
        confirmColor="error"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingPlan(null)}
      />

      <PlanFormDialog open={dialogOpen} plan={editingPlan} onClose={() => setDialogOpen(false)} onSaved={handleSaved} />
    </AppShell>
  );
}