import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { usePlatformAuth } from '../context/PlatformAuthContext';

export default function Login() {
  const { login } = usePlatformAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await login(email.trim(), password);

    setSubmitting(false);

    if (result.success) {
      navigate('/organizations', { replace: true });
    } else {
      // Per the build guide: don't build custom error copy, just surface what the API sends back.
      setError(result.message || 'Invalid credentials');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Brand panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '42%',
          minWidth: 380,
          p: 6,
          background: 'linear-gradient(160deg, #0b2021 0%, #14302f 55%, #203A43 100%)',
          color: '#fff',
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
            C
          </Box>
          <Typography variant="h6" fontWeight={800}>Canopux</Typography>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={800} sx={{ maxWidth: 380, lineHeight: 1.25 }}>
            Run every institute on Canopux from one place.
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', maxWidth: 380 }}>
            Provision institutes, manage plans and billing, and step in as a superadmin
            whenever a school needs a hand.
          </Typography>
        </Stack>

        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Platform Admin Console
        </Typography>
      </Box>

      {/* Form panel */}
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 3, bgcolor: 'background.default' }}>
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          <Stack spacing={1} sx={{ mb: 4, display: { md: 'none' } }}>
            <Typography variant="h5" fontWeight={800}>Canopux Platform</Typography>
          </Stack>
          <Stack spacing={0.5} sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight={800}>Sign in</Typography>
            <Typography variant="body2" color="text.secondary">
              Use your platform administrator account
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.25}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                fullWidth
                autoComplete="username"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                autoComplete="current-password"
              />
              <Button type="submit" variant="contained" size="large" disabled={submitting} fullWidth sx={{ py: 1.2 }}>
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}