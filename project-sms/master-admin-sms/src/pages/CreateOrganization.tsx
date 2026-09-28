import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  checkSlugAvailability,
  createOrganization,
  getPlans,
  type PlanSummary,
} from '../api/platformApiFunctions';
import { usePlatformAuth } from '../context/PlatformAuthContext';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function CreateOrganization() {
  const navigate = useNavigate();
  const { logout } = usePlatformAuth();

  const handleSessionExpired = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [planId, setPlanId] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ slug: string; emailed: boolean } | null>(null);

  // Load plans once on mount.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setPlansLoading(true);
      const result = await getPlans();

      if (cancelled) return;

      if (result.success && result.data) {
        setPlans(result.data);
        if (result.data.length > 0) setPlanId(result.data[0].id);
      } else if (result.status === 401) {
        handleSessionExpired();
      } else {
        setPlansError(result.message || 'Failed to load plans');
      }
      setPlansLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [handleSessionExpired]);

  // Auto-suggest the slug from the name, until the user edits the slug field directly.
  useEffect(() => {
    if (!slugTouched) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- derived value, syncing two controlled fields
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

  // Debounced live availability check whenever the (normalized) slug changes.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!slug || slug.length < 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- derived validity state, no async work needed
      setSlugStatus(slug.length === 0 ? 'idle' : 'invalid');
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSlugStatus('checking');
      const result = await checkSlugAvailability(slug);

      if (result.success && result.data) {
        setSlugStatus(result.data.available ? 'available' : 'taken');
      } else if (result.status === 401) {
        handleSessionExpired();
      } else {
        setSlugStatus('idle');
      }
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [slug, handleSessionExpired]);

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(slugify(value));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (slugStatus !== 'available') {
      setSubmitError('Please choose an available subdomain slug before continuing.');
      return;
    }
    if (!planId) {
      setSubmitError('Please select a plan.');
      return;
    }

    setSubmitting(true);
    const result = await createOrganization({
      name: name.trim(),
      slug,
      planId,
      primaryContact: {
        name: contactName.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
      },
    });
    setSubmitting(false);

    if (result.success && result.data) {
      setSuccess({
        slug: result.data.organization.slug,
        emailed: result.data.adminCredentialsEmailed,
      });
    } else if (result.status === 401) {
      handleSessionExpired();
    } else {
      setSubmitError(result.message || 'Failed to create organization');
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          px: 2,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 56, mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Organization created
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>{success.slug}.sms.canopux.org</strong> is ready to go.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {success.emailed
              ? "Login credentials have been emailed to the institute's primary contact."
              : 'The organization was created, but the credentials email could not be sent — please share the login details with the institute manually.'}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="outlined" onClick={() => window.location.reload()}>
              Add Another
            </Button>
            <Button variant="contained" onClick={() => navigate('/organizations')}>
              Back to List
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  const slugHelperText = (() => {
    switch (slugStatus) {
      case 'checking':
        return 'Checking availability…';
      case 'available':
        return `${slug}.sms.canopux.org is available`;
      case 'taken':
        return 'This slug is already taken';
      case 'invalid':
        return 'Slug must be at least 3 characters (letters, numbers, hyphens)';
      default:
        return "This becomes the institute's subdomain";
    }
  })();

  const slugAdornment = (() => {
    if (slugStatus === 'checking') return <CircularProgress size={18} />;
    if (slugStatus === 'available') return <CheckCircleIcon color="success" fontSize="small" />;
    if (slugStatus === 'taken' || slugStatus === 'invalid') return <CancelIcon color="error" fontSize="small" />;
    return null;
  })();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/organizations')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">New Organization</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper variant="outlined" sx={{ p: 4 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}
          {plansError && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {plansError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
              <Typography variant="subtitle1" fontWeight={700}>
                Institute Details
              </Typography>

              <TextField
                label="Institute Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Subdomain Slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                required
                fullWidth
                helperText={slugHelperText}
                error={slugStatus === 'taken' || slugStatus === 'invalid'}
                slotProps={{
                  input: {
                    endAdornment: slugAdornment ? (
                      <InputAdornment position="end">{slugAdornment}</InputAdornment>
                    ) : undefined,
                  },
                }}
              />

              <TextField
                select
                label="Plan"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                required
                fullWidth
                disabled={plansLoading || plans.length === 0}
              >
                {plans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name}
                    {plan.isCustom
                      ? ' (Custom)'
                      : ` — up to ${plan.maxStudents ?? '∞'} students, ₹${plan.monthlyPrice}/mo`}
                  </MenuItem>
                ))}
              </TextField>

              <Typography variant="subtitle1" fontWeight={700} sx={{ pt: 1 }}>
                Primary Contact
              </Typography>

              <TextField
                label="Contact Name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Contact Email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                fullWidth
                helperText="Admin login credentials will be sent here"
              />

              <TextField
                label="Contact Phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting || slugStatus !== 'available'}
                fullWidth
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Create Organization'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}