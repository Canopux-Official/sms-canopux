
import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Remove as NoRecordIcon,
} from '@mui/icons-material';
import type { StudentWithDirtyFlag } from '../types';
import { getWeekday, isToday } from '../utils/DateUtils';

interface AttendanceGridProps {
  students: StudentWithDirtyFlag[];
  dayHeaders: number[];
  month: number;
  year: number;
  onToggleAttendance: (studentId: string, day: number) => void;
}

export const AttendanceGrid: React.FC<AttendanceGridProps> = ({
  students,
  dayHeaders,
  month,
  year,
  onToggleAttendance,
}) => {
  const getStatusIcon = (status: boolean | null, day: number) => {
    const isTodayCell = isToday(day, month, year);

    if (status === true) {
      return (
        <PresentIcon
          sx={{
            color: 'success.main',
            fontSize: 24,
            filter: isTodayCell ? 'drop-shadow(0 0 4px rgba(76, 175, 80, 0.5))' : 'none',
          }}
        />
      );
    }
    if (status === false) {
      return (
        <AbsentIcon
          sx={{
            color: 'error.main',
            fontSize: 24,
            filter: isTodayCell ? 'drop-shadow(0 0 4px rgba(244, 67, 54, 0.5))' : 'none',
          }}
        />
      );
    }
    return (
      <NoRecordIcon
        sx={{
          color: 'text.disabled',
          fontSize: 24,
        }}
      />
    );
  };

  const getStatusText = (status: boolean | null): string => {
    if (status === true) return 'Present';
    if (status === false) return 'Absent';
    return 'No Record';
  };

  const isBeforeEnrollment = (student: StudentWithDirtyFlag, day: number): boolean => {
    const attendanceDate = new Date(year, month - 1, day);
    const enrollmentDate = new Date(student.admissionDate);
    enrollmentDate.setHours(0, 0, 0, 0);
    attendanceDate.setHours(0, 0, 0, 0);
    return attendanceDate < enrollmentDate;
  };

  const getCellBackground = (
    student: StudentWithDirtyFlag,
    day: number
  ): string => {
    const isTodayCell = isToday(day, month, year);
    const isDirtyDay = student.isDirty && student.dirtyDays?.has(day);
    const beforeEnrollment = isBeforeEnrollment(student, day);

    if (beforeEnrollment) {
      return 'rgba(158, 158, 158, 0.1)'; // Gray for disabled
    }
    if (isTodayCell) {
      return isDirtyDay ? 'rgba(255, 193, 7, 0.15)' : 'rgba(33, 150, 243, 0.08)';
    }
    if (isDirtyDay) {
      return 'rgba(255, 193, 7, 0.1)';
    }
    return 'transparent';
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        overflow: 'auto',
        backgroundColor: 'background.default',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TableContainer sx={{ height: '100%' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  position: 'sticky',
                  left: 0,
                  zIndex: 3,
                  backgroundColor: 'background.paper',
                  minWidth: 200,
                  borderRight: 2,
                  borderColor: 'divider',
                }}
              >
                Student Name
              </TableCell>
              {dayHeaders.map((day) => {
                const isTodayHeader = isToday(day, month, year);
                return (
                  <TableCell
                    key={day}
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      minWidth: 80,
                      backgroundColor: isTodayHeader
                        ? 'primary.light'
                        : 'background.paper',
                      color: isTodayHeader ? 'primary.contrastText' : 'inherit',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {day}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {getWeekday(day, month, year)}
                      </Typography>
                    </Box>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student, index) => (
              <TableRow
                key={student.studentId}
                sx={{
                  backgroundColor:
                    index % 2 === 0 ? 'background.paper' : 'background.default',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  borderLeft: student.isDirty ? 4 : 0,
                  borderColor: 'warning.main',
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    position: 'sticky',
                    left: 0,
                    zIndex: 400,  // bump this up from 3
                    backgroundColor: 'background.paper',
                    minWidth: 200,
                    borderRight: 2,
                    borderColor: 'divider',
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {student.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      P: {student.attendance.stats.present} | A:{' '}
                      {student.attendance.stats.absent}
                    </Typography>
                    {student.isDirty && (
                      <Chip
                        label="Unsaved"
                        size="small"
                        color="warning"
                        sx={{ ml: 1, height: 18, fontSize: '0.65rem' }}
                      />
                    )}
                  </Box>
                </TableCell>
                {dayHeaders.map((day) => {
                  const status = student.attendance.days[day.toString()];
                  const beforeEnrollment = isBeforeEnrollment(student, day);
                  const enrollDate = new Date(student.admissionDate).toLocaleDateString();

                  return (
                    <TableCell
                      key={day}
                      align="center"
                      sx={{
                        cursor: beforeEnrollment ? 'not-allowed' : 'pointer',
                        backgroundColor: getCellBackground(student, day),
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: beforeEnrollment ? getCellBackground(student, day) : 'action.hover',
                        },
                        opacity: beforeEnrollment ? 0.5 : 1,
                      }}
                      onClick={() => {
                        if (!beforeEnrollment) {
                          onToggleAttendance(student.studentId, day);
                        }
                      }}
                    >
                      <Tooltip
                        title={
                          beforeEnrollment
                            ? `Not enrolled yet (Enrolled: ${enrollDate})`
                            : getStatusText(status)
                        }
                        arrow
                        placement="bottom"
                        slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'preventOverflow',
                                options: {
                                  boundary: 'window',
                                },
                              },
                              {
                                name: 'flip',
                                options: {
                                  fallbackPlacements: ['top', 'bottom'],
                                },
                              },
                            ],
                            style: { zIndex: 9999 },
                          },
                        }}
                      >
                        <Box sx={{ display: 'inline-flex' }}>
                          {getStatusIcon(status, day)}
                        </Box>
                      </Tooltip>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {students.length === 0 && (
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200%',        // fill the parent's height
            minHeight: 20,        // fallback if parent has no fixed height
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No students found for the selected filters
          </Typography>
        </Box>
      )}
    </Paper>
  );
};