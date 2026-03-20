// components/AttendanceLegend.tsx

import React from 'react';
import { Box, Typography } from '@mui/material';

const AttendanceLegend: React.FC = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        mb: 2,
        flexWrap: 'wrap',
      }}
    >
      <Typography 
        variant="caption" 
        sx={{ 
          color: '#666',
          fontSize: '0.75rem',
          fontWeight: 500,
        }}
      >
        Legend:
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            backgroundColor: '#4caf50',
            borderRadius: '2px',
          }}
        />
        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
          Present
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            backgroundColor: '#f44336',
            borderRadius: '2px',
          }}
        />
        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
          Absent
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            backgroundColor: '#e8eaed',
            borderRadius: '2px',
          }}
        />
        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
          No Data
        </Typography>
      </Box>
    </Box>
  );
};

export default AttendanceLegend;