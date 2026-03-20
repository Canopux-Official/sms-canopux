// pages/StudentAttendance.tsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import YearSelector from '../components/YearSelector';
import AttendanceStats from '../components/AttendanceStats';
import AttendanceCalendar from '../components/AttendanceCalendar';
import { getCurrentMonthYear } from '../utils/DateUtils';
import type { AttendanceData } from '../types';
import { attendanceService } from '../services/Attendance.services';

const StudentAttendance: React.FC = () => {
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentMonthYear().year);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available years on component mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await attendanceService.getAvailableYears();
        if (response.success) {
          setAvailableYears(response.data.years);
          // If current year not in available years, use the most recent one
          if (!response.data.years.includes(selectedYear) && response.data.years.length > 0) {
            setSelectedYear(response.data.years[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch years:', err);
        // Fallback to current year
        setAvailableYears([selectedYear]);
      }
    };

    fetchYears();
  }, []);

  // Fetch attendance data when year changes
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedYear) return;

      setLoading(true);
      setError(null);

      try {
        const response = await attendanceService.getYearlyAttendance(selectedYear);
        
        if (response.success) {
          setAttendanceData(response.data);
        } else {
          setError(response.message || 'Failed to fetch attendance data');
        }
      } catch (err) {
        setError('Unable to load attendance data. Please try again later.');
        console.error('Error fetching attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedYear]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h5" 
          component="h1"
          sx={{ 
            fontWeight: 700,
            color: '#333',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            mb: 0.5,
          }}
        >
          My Attendance
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666',
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
          }}
        >
          Track your attendance throughout the year
        </Typography>
      </Box>

      {/* Year Selector */}
      {availableYears.length > 0 && (
        <YearSelector
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
        />
      )}

      {/* Loading State */}
      {loading && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: 300,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            fontSize: '0.875rem',
          }}
        >
          {error}
        </Alert>
      )}

      {/* Attendance Data */}
      {!loading && !error && attendanceData && (
        <>
          {/* Statistics */}
          <AttendanceStats stats={attendanceData.overallStats} />

          {/* Calendar */}
          <AttendanceCalendar attendanceData={attendanceData} />
        </>
      )}

      {/* No Data State */}
      {!loading && !error && !attendanceData && (
        <Alert 
          severity="info"
          sx={{ 
            fontSize: '0.875rem',
          }}
        >
          No attendance data available for the selected year.
        </Alert>
      )}
    </Container>
  );
};

export default StudentAttendance;