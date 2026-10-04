import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, CircularProgress, InputAdornment, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import DomainIcon from '@mui/icons-material/Domain';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import BlockIcon from '@mui/icons-material/Block';
import { deleteOrganization, getOrganizations, updateOrganizationStatus, type OrganizationSummary } from '../api/platformApiFunctions';
import { usePlatformAuth } from '../context/PlatformAuthContext';
import AppShell from '../components/AppShell';
import StatCard from '../components/StatCard';
import OrgStatusBadge from '../components/OrgStatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import DeleteOrganizationDialog from '../components/DeleteOrganizationDialog';

type PendingAction = { org: OrganizationSummary; nextStatus: 'active' | 'suspended' };

export default function OrganizationList() {
  const { logout } = usePlatformAuth();
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OrganizationSummary | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSessionExpired = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const loadOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getOrganizations();
    if (result.success && result.data) {
      setOrganizations(result.data);
    } else if (result.status === 401) {
      handleSessionExpired();
      return;
    } else {
      setError(result.message || 'Failed to load organizations');
    }
    setLoading(false);
  }, [handleSessionExpired]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrganizations();
  }, [loadOrganizations]);

  const handleConfirmToggle = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    const result = await updateOrganizationStatus(pendingAction.org.id, pendingAction.nextStatus);
    setActionLoading(false);
    if (result.success) {
      setPendingAction(null);
      loadOrganizations();
    } else if (result.status === 401) {
      handleSessionExpired();
    } else {
      setError(result.message || 'Failed to update organization status');
      setPendingAction(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    const result = await deleteOrganization(deleteTarget.id, deleteTarget.slug);
    setDeleteLoading(false);
    if (result.success) {
      setDeleteTarget(null);
      loadOrganizations();
    } else if (result.status === 401) {
      handleSessionExpired();
    } else {
      setDeleteError(result.message || 'Failed to delete organization');
    }
  };

  const stats = useMemo(() => {
    const active = organizations.filter((o) => o.status === 'active').length;
    const suspended = organizations.filter((o) => o.status === 'suspended').length;
    return { total: organizations.length, active, suspended };
  }, [organizations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return organizations;
    return organizations.filter((o) => o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q));
  }, [organizations, search]);

  return (
    <AppShell
      title="Organizations"
      subtitle="Every institute running on Canopux"
      actions={
        <>
          <Button startIcon={<RefreshIcon />} onClick={loadOrganizations} disabled={loading}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/organizations/new')}>
            New Organization
          </Button>
        </>
      }
    >
      <Stack spacing={3}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          <StatCard label="Total institutes" value={stats.total} icon={<DomainIcon />} accent="#0b2021" />
          <StatCard label="Active" value={stats.active} icon={<CheckCircleOutlineIcon />} accent="#2e7d32" />
          <StatCard label="Suspended" value={stats.suspended} icon={<BlockIcon />} accent="#c62828" />
        </Box>

        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

        <TextField
          size="small"
          placeholder="Search by name or subdomain…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 340 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
        />

        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: 'action.hover', fontWeight: 700, fontSize: 12.5, letterSpacing: 0.3, textTransform: 'uppercase', color: 'text.secondary' } }}>
                  <TableCell>Institute</TableCell>
                  <TableCell>Subdomain</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Students</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}><CircularProgress size={28} /></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">
                        {organizations.length === 0 ? 'No organizations yet. Create the first one to get started.' : 'No institutes match your search.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((org) => {
                    const maxStudents = org.plan?.maxStudents;
                    const usageLabel = `${org.usage.currentStudentCount}${maxStudents != null ? ` / ${maxStudents}` : ''}`;
                    const canReactivate = org.status === 'suspended';
                    const nextStatus: 'active' | 'suspended' = canReactivate ? 'active' : 'suspended';

                    return (
                      <TableRow
                        key={org.id}
                        hover
                        onClick={() => navigate(`/organizations/${org.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Typography fontWeight={600}>{org.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" variant="outlined" label={`${org.slug}.sms.canopux.org`} sx={{ fontFamily: 'monospace', fontSize: 12 }} />
                        </TableCell>
                        <TableCell>{org.plan?.name ?? '—'}</TableCell>
                        <TableCell><OrgStatusBadge status={org.status} /></TableCell>
                        <TableCell>{usageLabel}</TableCell>
                        <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          {org.status === 'cancelled' ? (
                            <Typography variant="caption" color="text.secondary">No actions</Typography>
                          ) : (
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="outlined"
                                color={canReactivate ? 'success' : 'error'}
                                onClick={() => setPendingAction({ org, nextStatus })}
                              >
                                {canReactivate ? 'Reactivate' : 'Suspend'}
                              </Button>
                              {canReactivate && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  startIcon={<DeleteForeverIcon fontSize="small" />}
                                  onClick={() => { setDeleteError(null); setDeleteTarget(org); }}
                                >
                                  Delete
                                </Button>
                              )}
                            </Stack>
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
      </Stack>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.nextStatus === 'suspended' ? 'Suspend organization?' : 'Reactivate organization?'}
        description={
          pendingAction?.nextStatus === 'suspended'
            ? `This will immediately block all access for "${pendingAction?.org.name}". Their admins and students won't be able to log in until you reactivate them.`
            : `This will restore access for "${pendingAction?.org.name}".`
        }
        confirmLabel="Confirm"
        confirmColor={pendingAction?.nextStatus === 'suspended' ? 'error' : 'success'}
        loading={actionLoading}
        onConfirm={handleConfirmToggle}
        onCancel={() => setPendingAction(null)}
      />

      <DeleteOrganizationDialog
        open={Boolean(deleteTarget)}
        organizationName={deleteTarget?.name ?? ''}
        slug={deleteTarget?.slug ?? ''}
        loading={deleteLoading}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  );
}