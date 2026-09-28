import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import { getOrganizations, updateOrganizationStatus, type OrganizationSummary } from '../api/platformApiFunctions';
import { usePlatformAuth } from '../context/PlatformAuthContext';
import OrgStatusBadge from '../components/OrgStatusBadge';

type PendingAction = { org: OrganizationSummary; nextStatus: 'active' | 'suspended' };

export default function OrganizationList() {
  const { user, logout } = usePlatformAuth();
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
    // Standard fetch-on-mount: loadOrganizations sets loading/error/data state internally.
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

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Canopux Platform Admin
          </Typography>
          {user && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user.name}
            </Typography>
          )}
          <Tooltip title="Sign out">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5">Organizations</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<RefreshIcon />} onClick={loadOrganizations} disabled={loading}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/organizations/new')}>
              New Organization
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
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
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : organizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      No organizations yet. Create the first one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  organizations.map((org) => {
                    const maxStudents = org.plan?.maxStudents;
                    const usageLabel = `${org.usage.currentStudentCount}${
                      maxStudents != null ? ` / ${maxStudents}` : ''
                    }`;
                    // The shared contract's PATCH endpoint only accepts 'active' | 'suspended',
                    // so a 'cancelled' org has no toggle here, and 'trial' -> suspend -> reactivate
                    // lands back on 'active' rather than restoring 'trial'. That's a known,
                    // intentional simplification matching the contract as written.
                    const canSuspend = org.status === 'active' || org.status === 'trial';
                    const canReactivate = org.status === 'suspended';
                    const nextStatus: 'active' | 'suspended' = canReactivate ? 'active' : 'suspended';

                    return (
                      <TableRow key={org.id} hover>
                        <TableCell>{org.name}</TableCell>
                        <TableCell>{org.slug}.sms.canopux.org</TableCell>
                        <TableCell>{org.plan?.name ?? '—'}</TableCell>
                        <TableCell>
                          <OrgStatusBadge status={org.status} />
                        </TableCell>
                        <TableCell>{usageLabel}</TableCell>
                        <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          {canSuspend || canReactivate ? (
                            <Button
                              size="small"
                              variant="outlined"
                              color={canReactivate ? 'success' : 'error'}
                              onClick={() => setPendingAction({ org, nextStatus })}
                            >
                              {canReactivate ? 'Reactivate' : 'Suspend'}
                            </Button>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No actions
                            </Typography>
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
      </Container>

      <Dialog open={Boolean(pendingAction)} onClose={() => setPendingAction(null)}>
        <DialogTitle>
          {pendingAction?.nextStatus === 'suspended' ? 'Suspend organization?' : 'Reactivate organization?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingAction?.nextStatus === 'suspended'
              ? `This will immediately block all access for "${pendingAction?.org.name}". Their admins and students won't be able to log in until you reactivate them.`
              : `This will restore access for "${pendingAction?.org.name}".`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingAction(null)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmToggle}
            color={pendingAction?.nextStatus === 'suspended' ? 'error' : 'success'}
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}