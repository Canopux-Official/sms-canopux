import { useEffect, useState } from 'react';
import {
  Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography,
} from '@mui/material';

interface DeleteOrganizationDialogProps {
  open: boolean;
  organizationName: string;
  slug: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Irreversible-action guard: the slug has to be typed before the delete button unlocks. */
export default function DeleteOrganizationDialog({
  open, organizationName, slug, loading = false, error, onConfirm, onCancel,
}: DeleteOrganizationDialogProps) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setTyped('');
  }, [open]);

  const matches = typed.trim().toLowerCase() === slug.toLowerCase();

  return (
    <Dialog open={open} onClose={loading ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Delete "{organizationName}" permanently?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          This permanently erases the institute and everything in it: admins (email and phone numbers), students,
          attendance, marks, notices, study material, landing page, plans, invoices and payment history.
          <b> This cannot be undone.</b>
        </DialogContentText>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography variant="body2" sx={{ mb: 1 }}>
          Type <b style={{ fontFamily: 'monospace' }}>{slug}</b> to confirm.
        </Typography>
        <TextField
          autoFocus
          fullWidth
          size="small"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={slug}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={!matches || loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Delete forever'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}