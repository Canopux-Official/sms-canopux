// components/AttendanceStats.tsx

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import type { OverallStats } from '../types';
import { formatPercentage } from '../utils/DateUtils';

interface AttendanceStatsProps {
  stats: OverallStats;
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2.5, 
        mb: 3,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
      }}
    >
      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontWeight: 600, 
          mb: 2,
          color: '#333',
          fontSize: '0.875rem'
        }}
      >
        Attendance Summary
      </Typography>

      {/* Flex Container for Stats */}
      <Box 
        sx={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'space-between',
        }}
      >
        {/* Total Days */}
        <Box 
          sx={{ 
            flex: '1 1 calc(50% - 8px)', // 50% width on mobile (2 per row)
            minWidth: '120px',
            textAlign: 'center',
            '@media (min-width: 600px)': {
              flex: '1 1 calc(25% - 12px)', // 25% width on desktop (4 per row)
            }
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: '#1976d2',
              fontSize: { xs: '1.5rem', sm: '1.75rem' }
            }}
          >
            {stats.totalDaysMarked}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#666',
              fontSize: '0.75rem',
              display: 'block',
              mt: 0.5
            }}
          >
            Total Days
          </Typography>
        </Box>

        {/* Present */}
        <Box 
          sx={{ 
            flex: '1 1 calc(50% - 8px)',
            minWidth: '120px',
            textAlign: 'center',
            '@media (min-width: 600px)': {
              flex: '1 1 calc(25% - 12px)',
            }
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: '#4caf50',
              fontSize: { xs: '1.5rem', sm: '1.75rem' }
            }}
          >
            {stats.totalPresent}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#666',
              fontSize: '0.75rem',
              display: 'block',
              mt: 0.5
            }}
          >
            Present
          </Typography>
        </Box>

        {/* Absent */}
        <Box 
          sx={{ 
            flex: '1 1 calc(50% - 8px)',
            minWidth: '120px',
            textAlign: 'center',
            '@media (min-width: 600px)': {
              flex: '1 1 calc(25% - 12px)',
            }
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: '#f44336',
              fontSize: { xs: '1.5rem', sm: '1.75rem' }
            }}
          >
            {stats.totalAbsent}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#666',
              fontSize: '0.75rem',
              display: 'block',
              mt: 0.5
            }}
          >
            Absent
          </Typography>
        </Box>

        {/* Percentage */}
        <Box 
          sx={{ 
            flex: '1 1 calc(50% - 8px)',
            minWidth: '120px',
            textAlign: 'center',
            '@media (min-width: 600px)': {
              flex: '1 1 calc(25% - 12px)',
            }
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: stats.attendancePercentage >= 75 ? '#4caf50' : '#ff9800',
              fontSize: { xs: '1.5rem', sm: '1.75rem' }
            }}
          >
            {formatPercentage(stats.attendancePercentage)}%
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#666',
              fontSize: '0.75rem',
              display: 'block',
              mt: 0.5
            }}
          >
            Attendance
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default AttendanceStats;