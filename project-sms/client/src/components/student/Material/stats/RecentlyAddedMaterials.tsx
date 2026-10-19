

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Alert,
  IconButton, Snackbar, Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  InsertDriveFile as FileIcon,
  VideoFile as VideoIcon,
} from '@mui/icons-material';
import { fetchRecentMaterials, type RecentMaterial } from '../services/DashboardRecentMaterial';

interface Props {
  onNavigateToMaterial?: (fullPath: Array<{ id: string; heading: string }>) => void;
  maxItems?: number;
  showHeader?: boolean;
  containerStyles?: object;
}

const formatUpdatedAt = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isVideoFile = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'].includes(ext);
};

// ── Row ───────────────────────────────────────────────────────────────────────
const MaterialRow: React.FC<{
  m: RecentMaterial;
  onClick: () => void;
  isLast: boolean;
}> = ({ m, onClick, isLast }) => {
  const isVideo = m.fileDetails?.[0] ? isVideoFile(m.fileDetails[0].fileName) : false;

  return (
    <Box>
      <Box
        onClick={onClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.5, sm: 1.75 },
          cursor: 'pointer',
          transition: 'background 0.12s',
          '&:hover': { bgcolor: '#f9fafb' },
          '&:active': { bgcolor: '#f3f4f6' },
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isVideo
            ? <VideoIcon sx={{ fontSize: 18, color: '#6b7280' }} />
            : <FileIcon sx={{ fontSize: 18, color: '#6b7280' }} />}
        </Box>

        {/* Name + Subject */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.85rem', sm: '0.875rem' },
              color: '#111827',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {m.heading}
          </Typography>
          {m.subject && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                display: 'block',
                mt: 0.2,
              }}
            >
              {m.subject}
            </Typography>
          )}
        </Box>

        {/* Updated at */}
        <Typography
          variant="caption"
          sx={{
            flexShrink: 0,
            fontSize: { xs: '0.68rem', sm: '0.72rem' },
            color: '#9ca3af',
            whiteSpace: 'nowrap',
          }}
        >
          {formatUpdatedAt(m.updatedAt)}
        </Typography>
      </Box>

      {!isLast && <Divider sx={{ borderColor: '#f3f4f6' }} />}
    </Box>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const RecentlyAddedMaterials: React.FC<Props> = ({
  onNavigateToMaterial,
  maxItems = 10,
  showHeader = true,
  containerStyles = {},
}) => {
  const [materials, setMaterials] = useState<RecentMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snack, setSnack] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try { setMaterials(await fetchRecentMaterials(maxItems)); }
    catch (e: any) { setError(e.message || 'Failed to load materials'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [maxItems]);

  const handleNavigate = (m: RecentMaterial) => {
    if (onNavigateToMaterial) return onNavigateToMaterial(m.fullPath);
    if (m.fileDetails?.[0]) window.open(m.fileDetails[0].uploadLink, '_blank');
  };

  if (loading) return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 3, ...containerStyles }}>
      <CircularProgress size={16} thickness={4} sx={{ color: '#9ca3af' }} />
      <Typography variant="body2" color="text.secondary">Loading…</Typography>
    </Box>
  );

  if (error) return (
    <Box sx={containerStyles}>
      <Alert severity="error" sx={{ borderRadius: 2 }}
        action={<IconButton size="small" onClick={load}><RefreshIcon fontSize="small" /></IconButton>}
      >{error}</Alert>
    </Box>
  );

  return (
    <Box sx={containerStyles}>
      {/* Header */}
      {showHeader && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#111827">
              Recently Added Materials
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Documents and videos uploaded by your teachers
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => { load(); setSnack(true); }}
            sx={{ border: '1px solid #e5e7eb', borderRadius: 1.5, p: 0.75 }}
          >
            <RefreshIcon fontSize="small" sx={{ color: '#6b7280' }} />
          </IconButton>
        </Box>
      )}

      {/* List */}
      {materials.length === 0 ? (
        <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
          No materials yet. New uploads will appear here.
        </Typography>
      ) : (
        <Paper
          elevation={0}
          sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}
        >
          {materials.map((m, i) => (
            <MaterialRow
              key={m._id}
              m={m}
              onClick={() => handleNavigate(m)}
              isLast={i === materials.length - 1}
            />
          ))}
        </Paper>
      )}

      <Snackbar
        open={snack}
        autoHideDuration={2500}
        onClose={() => setSnack(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        message="Refreshing materials…"
      />
    </Box>
  );
};

export default RecentlyAddedMaterials;