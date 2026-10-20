import { useEffect, useRef, useState } from 'react';
import {
  Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  InputAdornment, TextField,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { checkUsernameAvailability, updateOrganizationUsername } from '../api/platformApiFunctions';
import { USERNAME_REGEX, sanitizeUsername } from '../utils/username';

type Status = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

interface EditUsernameDialogProps {
  open: boolean;
  organizationId: string;
  currentUsername: string | null;
  onClose: () => void;
  onSaved: (username: string) => void;
  onSessionExpired: () => void;
}

export default function EditUsernameDialog({
  open, organizationId, currentUsername, onClose, onSaved, onSessionExpired,
}: EditUsernameDialogProps) {
  const [username, setUsername] = useState(currentUsername ?? '');
  const [status, setStatus] = useState<Status>('idle');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset the form every time the dialog is (re)opened.
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting form state on open
      setUsername(currentUsername ?? '');
      setStatus('idle');
      setError(null);
    }
  }, [open, currentUsername]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (username.length === 0 || username === (currentUsername ?? '')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- derived validity state
      setStatus('idle');
      return;
    }
    if (!USERNAME_REGEX.test(username)) {
      setStatus('invalid');
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setStatus('checking');
      const result = await checkUsernameAvailability(username, organizationId);
      if (result.success && result.data) {
        setStatus(result.data.available ? 'available' : 'taken');
      } else if (result.status === 401) {
        onSessionExpired();
      } else {
        setStatus('idle');
      }
    }, 450);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username, open, organizationId, currentUsername, onSessionExpired]);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    const result = await updateOrganizationUsername(organizationId, username);
    setSaving(false);
    if (result.success && result.data) {
      onSaved(result.data.organization.username);
    } else if (result.status === 401) {
      onSessionExpired();
    } else {
      setError(result.message || 'Failed to update username');
    }
  };

  const helperText = (() => {
    switch (status) {
      case 'checking': return 'Checking availability…';
      case 'available': return 'This username is available';
      case 'taken': return 'This username is already taken';
      case 'invalid': return '3–32 characters: lowercase letters, numbers, hyphens, underscores (start and end with a letter or number)';
      default: return 'Used by the institute to identify itself in the mobile app';
    }
  })();

  const adornment = (() => {
    if (status === 'checking') return <CircularProgress size={18} />;
    if (status === 'available') return <CheckCircleIcon color="success" fontSize="small" />;
    if (status === 'taken' || status === 'invalid') return <CancelIcon color="error" fontSize="small" />;
    return null;
  })();

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{currentUsername ? 'Edit username' : 'Set username'}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {currentUsername
            ? 'Changing the username takes effect immediately — the old one stops working in the mobile app, so let the institute know.'
            : 'This institute has no mobile-app username yet. Choose a unique one.'}
        </DialogContentText>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          autoFocus fullWidth label="Username" value={username}
          onChange={(e) => setUsername(sanitizeUsername(e.target.value))}
          helperText={helperText} error={status === 'taken' || status === 'invalid'}
          slotProps={{ input: { endAdornment: adornment ? <InputAdornment position="end">{adornment}</InputAdornment> : undefined } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving || status !== 'available'}>
          {saving ? <CircularProgress size={20} color="inherit" /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}