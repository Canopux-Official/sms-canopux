// components/MonthCalendar.tsx

import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import type { MonthData } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, MONTH_NAMES_FULL } from '../utils/DateUtils';

interface MonthCalendarProps {
  monthData: MonthData;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({ monthData }) => {
  const { month, year, days, hasData, message, status } = monthData;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfMonth(year, month);

  // Create array for calendar grid (7 columns for week)
  const calendarDays: (number | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const renderDay = (day: number | null, index: number) => {
    if (day === null) {
      return (
        <Box
          key={`empty-${index}`}
          sx={{
            width: { xs: 10, sm: 12 },
            height: { xs: 10, sm: 12 },
            m: 0.25,
          }}
        />
      );
    }

    const dayKey = day.toString();
    const isPresent = days[dayKey] === true;
    const isAbsent = days[dayKey] === false;
    const isMarked = hasData && (isPresent || isAbsent);

    let backgroundColor = '#e8eaed'; // Default (not marked)
    let tooltipText = 'No data';

    if (isPresent) {
      backgroundColor = '#4caf50'; // Green for present
      tooltipText = `Present on ${month}/${day}`;
    } else if (isAbsent) {
      backgroundColor = '#f44336'; // Red for absent
      tooltipText = `Absent on ${month}/${day}`;
    } else if (status === 'future') {
      backgroundColor = '#f5f5f5';
      tooltipText = 'Future date';
    }

    return (
      <Tooltip title={tooltipText} key={`day-${day}`} arrow>
        <Box
          sx={{
            width: { xs: 10, sm: 12 },
            height: { xs: 10, sm: 12 },
            backgroundColor,
            borderRadius: '2px',
            m: 0.25,
            cursor: isMarked ? 'pointer' : 'default',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': isMarked ? {
              transform: 'scale(1.3)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              zIndex: 1,
            } : {},
          }}
        />
      </Tooltip>
    );
  };

  return (
    <Box 
      sx={{ 
        minWidth: { xs: 130, sm: 150 },
        mb: 3,
        px: 1,
      }}
    >
      {/* Month Label */}
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mb: 1,
          fontWeight: 600,
          color: status === 'future' ? '#999' : '#333',
          fontSize: { xs: '0.7rem', sm: '0.75rem' },
        }}
      >
        {MONTH_NAMES_FULL[month - 1]}
      </Typography>

      {/* Calendar Grid */}
      {!hasData && message ? (
        <Box
          sx={{
            minHeight: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9f9f9',
            borderRadius: 1,
            border: '1px dashed #ddd',
            p: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#999',
              fontSize: { xs: '0.65rem', sm: '0.7rem' },
              textAlign: 'center',
            }}
          >
            {message}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0,
          }}
        >
          {calendarDays.map((day, index) => renderDay(day, index))}
        </Box>
      )}

      {/* Month Stats */}
      {hasData && monthData.stats.total > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: { xs: '0.65rem', sm: '0.7rem' },
              color: '#666',
            }}
          >
            <span style={{ color: '#4caf50', fontWeight: 600 }}>
              {monthData.stats.present}
            </span>
            {' / '}
            <span style={{ color: '#f44336', fontWeight: 600 }}>
              {monthData.stats.absent}
            </span>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MonthCalendar;