// StudentList.tsx

import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import type { StudentWithDirtyFlag } from '../types';

interface StudentListProps {
  students: StudentWithDirtyFlag[];
  selectedStudentId: string | null;
  onStudentSelect: (studentId: string) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  selectedStudentId,
  onStudentSelect,
}) => {
  const getAttendancePercentage = (student: StudentWithDirtyFlag): number => {
    const { present, absent } = student.attendance.stats;
    const total = present + absent;
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  const getPercentageColor = (percentage: number): string => {
    if (percentage >= 75) return 'success';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        overflow: 'auto',
        backgroundColor: 'background.default',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.default',
          zIndex: 1,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Students ({students.length})
        </Typography>
      </Box>

      <List sx={{ p: 0 }}>
        {students.map((student, index) => {
          const percentage = getAttendancePercentage(student);
          const isSelected = student.studentId === selectedStudentId;

          return (
            <ListItem
              key={student.studentId}
              onClick={() => onStudentSelect(student.studentId)}
              sx={{
                cursor: 'pointer',
                borderLeft: student.isDirty ? 4 : 0,
                borderColor: 'warning.main',
                backgroundColor: isSelected
                  ? 'action.selected'
                  : index % 2 === 0
                  ? 'background.paper'
                  : 'background.default',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                transition: 'all 0.2s',
                py: 1.5,
              }}
            >
              <ListItemText
                primary={
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body1" fontWeight="medium">
                      {student.name}
                    </Typography>
                    {student.isDirty && (
                      <Chip
                        label="Unsaved"
                        size="small"
                        color="warning"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Stack>
                }
                secondary={
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {student.phoneNumber}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {student.currentClass}
                        {student.stream && ` - ${student.stream}`}
                      </Typography>
                      <Chip
                        label={`${percentage}%`}
                        size="small"
                        color={getPercentageColor(percentage) as any}
                        sx={{ height: 18, fontSize: '0.65rem' }}
                      />
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      P: {student.attendance.stats.present} | A:{' '}
                      {student.attendance.stats.absent}
                    </Typography>
                  </Stack>
                }
              />
            </ListItem>
          );
        })}

        {students.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No students found
            </Typography>
          </Box>
        )}
      </List>
    </Paper>
  );
};