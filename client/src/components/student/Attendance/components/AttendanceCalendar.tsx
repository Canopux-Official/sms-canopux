// components/AttendanceCalendar.tsx

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import AttendanceLegend from './AttendanceLegend';
import type { AttendanceData } from '../types';
import MonthCalendar from './MonthCalendar';

interface AttendanceCalendarProps {
  attendanceData: AttendanceData;
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ attendanceData }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2.5,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 600, 
            color: '#333',
            fontSize: '0.875rem',
            mb: 1,
          }}
        >
          {attendanceData.year} Attendance Calendar
        </Typography>
        
        <AttendanceLegend />
      </Box>

      {/* Scrollable Month Container */}
      <Box
        sx={{
          overflowX: 'auto',
          overflowY: 'hidden',
          pb: 1,
          // Hide scrollbar for cleaner look but keep functionality
          '&::-webkit-scrollbar': {
            height: 6,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c1c1c1',
            borderRadius: 3,
            '&:hover': {
              backgroundColor: '#a8a8a8',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            minWidth: 'fit-content',
          }}
        >
          {attendanceData.months.map((monthData) => (
            <MonthCalendar 
              key={`${monthData.year}-${monthData.month}`}
              monthData={monthData}
            />
          ))}
        </Box>
      </Box>

      {/* Helper Text for Mobile */}
      <Typography
        variant="caption"
        sx={{
          display: { xs: 'block', sm: 'none' },
          color: '#999',
          fontSize: '0.65rem',
          mt: 1,
          textAlign: 'center',
        }}
      >
        Swipe left/right to view all months
      </Typography>
    </Paper>
  );
};

export default AttendanceCalendar;