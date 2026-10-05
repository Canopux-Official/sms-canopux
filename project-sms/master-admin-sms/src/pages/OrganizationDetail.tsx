import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert, Box, Button, CircularProgress, Divider, Paper, Stack, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginIcon from '@mui/icons-material/Login';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  deleteOrganization, downloadInvoicePdf, getOrganizationDetail, getOrganizationInvoices, loginAsOrganizationAdmin, updateOrganizationStatus,
  buildInstituteImpersonationUrl,
  type AssignPlanResult, type InvoiceSummary, type OrganizationBilling, type OrganizationDetail as OrgDetailType,
} from '../api/platformApiFunctions';
import { usePlatformAuth } from '../context/PlatformAuthContext';
import AppShell from '../components/AppShell';
import StatCard from '../components/StatCard';
import OrgStatusBadge from '../components/OrgStatusBadge';
import BillingLedger from '../components/BillingLedger';
import SubscriptionTimelineBar from '../components/SubscriptionTimelineBar';
import ConfirmDialog from '../components/ConfirmDialog';
import DeleteOrganizationDialog from '../components/DeleteOrganizationDialog';
import AssignPlanDialog from '../components/AssignPlanDialog';

const money = (n: number | undefined | null, currency = 'INR') => `${currency} ${(n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Plain-language summary of what a (mid-plan) change did to the old plan's charges. */
const describePlanChange = (r: AssignPlanResult): string => {
  const parts = [`Plan assigned: ${r.subscription.planName} — ${r.invoices.length} charge${r.invoices.length === 1 ? '' : 's'} scheduled.`];
  if (r.change.replacedPlans.length > 0) {
    const cur = r.subscription.pricing.currency;
    if (r.change.voidedCount > 0) {
      parts.push(`${r.change.voidedCount} future charge${r.change.voidedCount === 1 ? '' : 's'} of ${r.change.replacedPlans.join(', ')} (${money(r.change.voidedAmount, cur)}) were cancelled.`);
    }
    if (r.change.creditCarried > 0) {
      parts.push(`${money(r.change.creditCarried, cur)} already paid in advance was moved onto the new plan.`);
    }
    parts.push('Anything the old plan had already billed stays in the ledger exactly as it was.');
  }
  return parts.join(' ');
};

export default function OrganizationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = usePlatformAuth();

  const [organization, setOrganization] = useState<OrgDetailType | null>(null);
  const [billing, setBilling] = useState<OrganizationBilling | null>(null);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [assignPlanOpen, setAssignPlanOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [loginAsLoading, setLoginAsLoading] = useState(false);

  const [rowActionLoading, setRowActionLoading] = useState<string | null>(null);
  const [planChangeNotice, setPlanChangeNotice] = useState<string | null>(null);

  const handleSessionExpired = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  // `silent` refreshes the numbers in place (no full-page spinner) — used after payments and invoice actions.
  const load = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    setError(null);
    const [result, invoiceResult] = await Promise.all([
      getOrganizationDetail(id),
      getOrganizationInvoices(id),
    ]);
    if (invoiceResult.status === 401) {
      handleSessionExpired();
      return;
    }
    if (result.success && result.data) {
      setOrganization(result.data.organization);
      setBilling(result.data.billing);
      setInvoices(invoiceResult.success && invoiceResult.data ? invoiceResult.data : []);
    } else if (result.status === 401) {
      handleSessionExpired();
      return;
    } else {
      setError(result.message || 'Failed to load organization');
    }
    setLoading(false);
  }, [id, handleSessionExpired]);

  const refresh = useCallback(() => load(true), [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleToggleStatus = async () => {
    if (!organization) return;
    const nextStatus = organization.status === 'suspended' ? 'active' : 'suspended';
    setStatusLoading(true);
    const result = await updateOrganizationStatus(organization.id, nextStatus);
    setStatusLoading(false);
    if (result.success) {
      setStatusDialogOpen(false);
      refresh();
    } else if (result.status === 401) {
      handleSessionExpired();
    } else {
      setActionError(result.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!organization) return;
    setDeleteLoading(true);
    setDeleteError(null);
    const result = await deleteOrganization(organization.id, organization.slug);
    setDeleteLoading(false);
    if (result.success) {
      setDeleteDialogOpen(false);
      navigate('/organizations', { replace: true });
    } else if (result.status === 401) {
      handleSessionExpired();
    } else {
      setDeleteError(result.message || 'Failed to delete organization');
    }
  };

  const handleLoginAs = async () => {
    if (!organization) return;
    setLoginAsLoading(true);
    const result = await loginAsOrganizationAdmin(organization.id);
    setLoginAsLoading(false);
    if (result.success && result.data) {
      const url = buildInstituteImpersonationUrl(result.data.orgSlug, result.data.token);
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (result.status === 401) {
      handleSessionExpired();
    } else {
      setActionError(result.message || 'Failed to start login-as session');
    }
  };

  const handleDownload = async (invoice: InvoiceSummary) => {
    setRowActionLoading(invoice.id);
    const result = await downloadInvoicePdf(invoice.id, invoice.invoiceNumber);
    setRowActionLoading(null);
    if (!result.success) setActionError(result.message || 'Failed to download PDF');
  };

  if (loading) {
    return (
      <AppShell title="Loading…">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      </AppShell>
    );
  }

  if (error || !organization || !billing) {
    return (
      <AppShell title="Organization">
        <Alert severity="error">{error || 'Organization not found'}</Alert>
      </AppShell>
    );
  }

  const current = billing.currentSubscription;
  const sum = billing.invoiceSummary;

  return (
    <AppShell
      title={organization.name}
      subtitle={`${organization.slug}.sms.canopux.org`}
      actions={
        <>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/organizations')}>Back</Button>
          <Button
            variant="outlined"
            startIcon={loginAsLoading ? <CircularProgress size={16} /> : <LoginIcon />}
            onClick={handleLoginAs}
            disabled={loginAsLoading || !organization.superAdmin}
          >
            Login as Superadmin
          </Button>
          <Button
            variant="contained"
            color={organization.status === 'suspended' ? 'success' : 'error'}
            startIcon={<BlockIcon />}
            onClick={() => setStatusDialogOpen(true)}
            disabled={organization.status === 'cancelled'}
          >
            {organization.status === 'suspended' ? 'Reactivate' : 'Suspend'}
          </Button>
          {organization.status === 'suspended' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={() => { setDeleteError(null); setDeleteDialogOpen(true); }}
            >
              Delete institute
            </Button>
          )}
        </>
      }
    >
      <Stack spacing={3}>
        {actionError && <Alert severity="error" onClose={() => setActionError(null)}>{actionError}</Alert>}
        {!organization.superAdmin && (
          <Alert severity="warning" icon={<WarningAmberIcon />}>
            This organization has no superadmin account, so "Login as Superadmin" is unavailable.
          </Alert>
        )}

        {/* Overview stat row — all figures come from the ledger below */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          <StatCard label="Status" value={<OrgStatusBadge status={organization.status} />} icon={<GroupIcon />} accent="#0b2021" />
          <StatCard
            label="Total invoiced"
            value={money(sum.totalInvoiced)}
            icon={<ReceiptLongIcon />} accent="#7b1fa2"
            hint={sum.draftCount > 0 ? `+ ${money(sum.draftTotal)} in ${sum.draftCount} draft${sum.draftCount > 1 ? 's' : ''} (not issued)` : `${sum.count} charge${sum.count === 1 ? '' : 's'} incl. scheduled months`}
          />
          <StatCard label="Paid" value={money(sum.totalPaid)} icon={<CheckCircleOutlineIcon />} accent="#2e7d32" />
          <StatCard
            label="Outstanding (due now)"
            value={money(sum.outstanding)}
            icon={<AccountBalanceWalletIcon />}
            accent={sum.outstanding > 0 ? '#c62828' : '#2e7d32'}
            hint={sum.overdueCount > 0 ? `${money(sum.overdueAmount)} overdue (${sum.overdueCount})` : undefined}
          />
        </Box>

        {/* Plan / subscription + admin info */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Stack spacing={0.25}>
                <Typography variant="overline" color="text.secondary">Current plan</Typography>
                <Typography variant="h6" fontWeight={800}>{current?.planName || 'No plan assigned'}</Typography>
              </Stack>
              <Button size="small" variant="contained" startIcon={<AddIcon fontSize="small" />} onClick={() => setAssignPlanOpen(true)}>
                Assign plan
              </Button>
            </Stack>
            {current ? (
              <Stack spacing={2}>
                <SubscriptionTimelineBar subscription={current} />
                <Divider />
                <Stack direction="row" spacing={4} flexWrap="wrap">
                  <Stack spacing={0.25}>
                    <Typography variant="caption" color="text.secondary">Plan amount</Typography>
                    <Typography fontWeight={600}>{money(current.pricing.total, current.pricing.currency)}</Typography>
                  </Stack>
                  <Stack spacing={0.25}>
                    <Typography variant="caption" color="text.secondary">One-time fee</Typography>
                    <Typography fontWeight={600}>{money(current.oneTimePrice, current.pricing.currency)}</Typography>
                  </Stack>
                  <Stack spacing={0.25}>
                    <Typography variant="caption" color="text.secondary">Monthly maintenance</Typography>
                    <Typography fontWeight={600}>
                      {money(current.monthlyMaintenance, current.pricing.currency)}
                      {(current.maintenanceMonths ?? 0) > 0 ? ` × ${current.maintenanceMonths}` : ''}
                    </Typography>
                  </Stack>
                </Stack>
                {current.notes && (
                  <Typography variant="body2" color="text.secondary">Note: {current.notes}</Typography>
                )}
              </Stack>
            ) : (
              <Typography color="text.secondary">This institute hasn't been assigned a plan yet.</Typography>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="overline" color="text.secondary">Institute contact</Typography>
            <Stack spacing={1.25} sx={{ mt: 1 }}>
              <Stack spacing={0.1}>
                <Typography variant="caption" color="text.secondary">Superadmin</Typography>
                <Typography fontWeight={600}>{organization.superAdmin?.name || '—'}</Typography>
              </Stack>
              <Stack spacing={0.1}>
                <Typography variant="caption" color="text.secondary">Email</Typography>
                <Typography variant="body2">{organization.superAdmin?.email || '—'}</Typography>
              </Stack>
              <Stack spacing={0.1}>
                <Typography variant="caption" color="text.secondary">Contact no.</Typography>
                <Typography variant="body2">{organization.superAdmin?.phoneNumber || '—'}</Typography>
              </Stack>
              <Stack spacing={0.1}>
                <Typography variant="caption" color="text.secondary">Created on</Typography>
                <Typography variant="body2">{new Date(organization.createdAt).toLocaleDateString()}</Typography>
              </Stack>
            </Stack>
          </Paper>
        </Box>

        {planChangeNotice && <Alert severity="success" onClose={() => setPlanChangeNotice(null)}>{planChangeNotice}</Alert>}

        {/* Ledger: one block per plan purchase, one row per charge (one-time fee + each month) */}
        <BillingLedger
          subscriptions={billing.subscriptions}
          invoices={invoices}
          busyInvoiceId={rowActionLoading}
          onDownload={handleDownload}
          onChanged={refresh}
          onSessionExpired={handleSessionExpired}
        />
      </Stack>

      <ConfirmDialog
        open={statusDialogOpen}
        title={organization.status === 'suspended' ? 'Reactivate organization?' : 'Suspend organization?'}
        description={
          organization.status === 'suspended'
            ? `This will restore access for "${organization.name}".`
            : `This will immediately block all access for "${organization.name}". Their admins and students won't be able to log in until you reactivate them.`
        }
        confirmColor={organization.status === 'suspended' ? 'success' : 'error'}
        loading={statusLoading}
        onConfirm={handleToggleStatus}
        onCancel={() => setStatusDialogOpen(false)}
      />

      <DeleteOrganizationDialog
        open={deleteDialogOpen}
        organizationName={organization.name}
        slug={organization.slug}
        loading={deleteLoading}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <AssignPlanDialog
        open={assignPlanOpen}
        organizationId={organization.id}
        organizationName={organization.name}
        hasActiveSubscription={Boolean(current)}
        onClose={() => setAssignPlanOpen(false)}
        currentPlanName={current?.planName}
        onAssigned={(result) => {
          setAssignPlanOpen(false);
          setPlanChangeNotice(describePlanChange(result));
          refresh();
        }}
      />
    </AppShell>
  );
}