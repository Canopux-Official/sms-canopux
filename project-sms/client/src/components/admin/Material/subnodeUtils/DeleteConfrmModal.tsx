import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import type { Node } from '../types/node';

interface DeleteConfirmDialogProps {
  open: boolean;
  node: Node | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  node,
  onClose,
  onConfirm,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '12px',
          maxWidth: '500px',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          pb: 2,
          fontSize: '1.25rem',
          color: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <WarningIcon sx={{ color: '#d32f2f' }} />
        Confirm Delete
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Typography
          sx={{
            mb: 2,
            color: '#5f6368',
            fontSize: '0.9375rem',
          }}
        >
          Are you sure you want to delete <strong>{node?.heading}</strong>? This action cannot be undone.
        </Typography>
        {node?.type === 'folder' && (
          <Alert
            severity="warning"
            sx={{
              mb: 2,
              borderRadius: '8px',
            }}
          >
            This will also delete all files inside this folder.
          </Alert>
        )}
        <Alert
          severity="info"
          sx={{
            borderRadius: '8px',
          }}
        >
          Subfolders must be deleted separately before deleting the parent folder.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            color: '#5f6368',
            borderRadius: '8px',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            background: '#d32f2f',
            borderRadius: '8px',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              background: '#c62828',
            },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;