import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, CircularProgress, InputAdornment, Paper, Stack, TextField, Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  checkSlugAvailability,
  createOrganization,
} from '../api/platformApiFunctions';
import { usePlatformAuth } from '../context/PlatformAuthContext';
import AppShell from '../components/AppShell';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

// Matches the institute app's own login-form validation (10-digit mobile number) — an admin
// created with a phone number that fails this check would never be able to log in.
const PHONE_REGEX = /^[0-9]{10}$/;

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function CreateOrganization() {
  const navigate = useNavigate();
  const { logout } = usePlatformAuth();

  const handleSessionExpired = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ slug: string; emailed: boolean } | null>(null);

  useEffect(() => {
    if (!slugTouched) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- derived value, syncing two controlled fields
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

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
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [slug, handleSessionExpired]);

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(slugify(value));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (slugStatus !== 'available') return setSubmitError('Please choose an available subdomain slug before continuing.');
    if (!PHONE_REGEX.test(contactPhone.trim())) {
      return setSubmitError('Contact phone must be exactly 10 digits (this becomes the admin login username).');
    }

    setSubmitting(true);
    const result = await createOrganization({
      name: name.trim(),
      slug,
      primaryContact: { name: contactName.trim(), email: contactEmail.trim(), phone: contactPhone.trim() },
    });
    setSubmitting(false);

    if (result.success && result.data) {
      setSuccess({ slug: result.data.organization.slug, emailed: result.data.adminCredentialsEmailed });
    } else if (result.status === 401) {
      handleSessionExpired();
    } else {
      setSubmitError(result.message || 'Failed to create organization');
    }
  };

  if (success) {
    return (
      <AppShell title="New Organization">
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
          <Paper elevation={0} variant="outlined" sx={{ p: 4, width: '100%', maxWidth: 480, textAlign: 'center', borderRadius: 3 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 56, mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>Organization created</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{success.slug}.sms.canopux.org</strong> is ready to go.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {success.emailed
                ? "Login credentials have been emailed to the institute's primary contact."
                : 'The organization was created, but the credentials email could not be sent — please share the login details with the institute manually.'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              No plan is assigned yet — open the organization and use “Assign plan” when you're ready.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="outlined" onClick={() => window.location.reload()}>Add Another</Button>
              <Button variant="contained" onClick={() => navigate('/organizations')}>Back to List</Button>
            </Stack>
          </Paper>
        </Box>
      </AppShell>
    );
  }

  const slugHelperText = (() => {
    switch (slugStatus) {
      case 'checking': return 'Checking availability…';
      case 'available': return `${slug}.sms.canopux.org is available`;
      case 'taken': return 'This slug is already taken';
      case 'invalid': return 'Slug must be at least 3 characters (letters, numbers, hyphens)';
      default: return "This becomes the institute's subdomain";
    }
  })();

  const slugAdornment = (() => {
    if (slugStatus === 'checking') return <CircularProgress size={18} />;
    if (slugStatus === 'available') return <CheckCircleIcon color="success" fontSize="small" />;
    if (slugStatus === 'taken' || slugStatus === 'invalid') return <CancelIcon color="error" fontSize="small" />;
    return null;
  })();

  return (
    <AppShell title="New Organization" subtitle="Provision a new institute">
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Paper variant="outlined" sx={{ p: 4, width: '100%', maxWidth: 560, borderRadius: 3 }}>
          {submitError && <Alert severity="error" sx={{ mb: 3 }}>{submitError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
              <Typography variant="subtitle1" fontWeight={700}>Institute Details</Typography>

              <TextField label="Institute Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />

              <TextField
                label="Subdomain Slug" value={slug} onChange={(e) => handleSlugChange(e.target.value)} required fullWidth
                helperText={slugHelperText} error={slugStatus === 'taken' || slugStatus === 'invalid'}
                slotProps={{ input: { endAdornment: slugAdornment ? <InputAdornment position="end">{slugAdornment}</InputAdornment> : undefined } }}
              />

              <Typography variant="subtitle1" fontWeight={700} sx={{ pt: 1 }}>Primary Contact</Typography>

              <TextField label="Contact Name" value={contactName} onChange={(e) => setContactName(e.target.value)} required fullWidth />
              <TextField
                label="Contact Email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required fullWidth
                helperText="Admin login credentials will be sent here"
              />
              <TextField
                label="Contact Phone" value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                required fullWidth helperText="10 digits — this becomes the admin's login username"
                error={contactPhone.length > 0 && !PHONE_REGEX.test(contactPhone)}
              />

              <Button type="submit" variant="contained" size="large" disabled={submitting || slugStatus !== 'available'} fullWidth>
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Create Organization'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </AppShell>
  );
}