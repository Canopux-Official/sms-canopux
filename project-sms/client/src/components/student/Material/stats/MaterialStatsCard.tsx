
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Divider } from '@mui/material';
import { fetchMaterialStats } from '../services/DashboardRecentMaterial';

interface MaterialStats { today: number; thisWeek: number; total: number }

const STATS = (s: MaterialStats) => [
  { label: 'Added Today', value: s.today, sub: 'New materials' },
  { label: 'This Week', value: s.thisWeek, sub: 'Last 7 days' },
  { label: 'Total Materials', value: s.total, sub: 'All time' },
];

const MaterialStatsCard: React.FC = () => {
  const [stats, setStats] = useState<MaterialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try { setStats(await fetchMaterialStats()); }
      catch (e: any) { setError(e.message || 'Failed to load statistics'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2.5, color: 'text.secondary' }}>
      <CircularProgress size={16} thickness={4} color="inherit" />
      <Typography variant="body2" color="text.secondary">Loading statistics…</Typography>
    </Box>
  );

  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;
  if (!stats) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid', borderColor: 'grey.200',
        borderRadius: 3, overflow: 'hidden',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      }}
    >
      {STATS(stats).map(({ label, value, sub }, i) => (
        <Box key={label} sx={{ display: 'flex', alignItems: 'stretch' }}>
          <Box sx={{ flex: 1, px: 3.5, py: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              sx={{ fontSize: 32, fontWeight: 700, color: 'text.primary', letterSpacing: '-1px', lineHeight: 1 }}
            >
              {value}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {label}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {sub}
            </Typography>
          </Box>
          {i < 2 && <Divider orientation="vertical" flexItem />}
        </Box>
      ))}
    </Paper>
  );
};

export default MaterialStatsCard;