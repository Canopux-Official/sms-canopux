import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: string;
  hint?: string;
}

export default function StatCard({ label, value, icon, accent = '#2f6fed', hint }: StatCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: '100%',
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${accent}1a`,
            color: accent,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}
      <Stack spacing={0.25} minWidth={0}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={800} noWrap>
          {value}
        </Typography>
        {hint && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {hint}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}