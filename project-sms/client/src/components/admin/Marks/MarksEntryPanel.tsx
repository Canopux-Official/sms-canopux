import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Checkbox,
  Button,
  CircularProgress,
  Chip,
  Alert,
  Stack,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/RemoveCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMarksEntry, saveMarksEntry, publishTest, unpublishTest } from './services/marksApi';
import type { Test, MarksEntryRow } from './types/types';

interface MarksEntryPanelProps {
  test: Test;
  onBack: () => void;
}

const MarksEntryPanel: React.FC<MarksEntryPanelProps> = ({ test, onBack }) => {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<MarksEntryRow[]>([]);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());

  const { data: response, isLoading } = useQuery({
    queryKey: ['marksEntry', test._id],
    queryFn: () => getMarksEntry(test._id),
  });

  // Always trust the latest server test status (it can flip via publish/unpublish mutations below)
  const currentStatus = response?.success && response.data ? response.data.test.status : test.status;
  const isPublished = currentStatus === 'published';

  const effectiveTestDate = response?.success && response.data ? response.data.test.testDate : test.testDate;
  const isBeforeTestDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduledDate = new Date(effectiveTestDate);
    scheduledDate.setHours(0, 0, 0, 0);
    return today < scheduledDate;
  }, [effectiveTestDate]);

  useEffect(() => {
    if (response?.success && response.data) {
      setRows(response.data.results);
      setDirtyIds(new Set());
    }
  }, [response]);

  const handleMarksChange = (studentId: string, value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.studentId === studentId
          ? { ...r, marksObtained: value === '' ? null : Number(value), isAbsent: false }
          : r
      )
    );
    setDirtyIds((prev) => new Set(prev).add(studentId));
  };

  const handleAbsentToggle = (studentId: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.studentId === studentId
          ? { ...r, isAbsent: !r.isAbsent, marksObtained: !r.isAbsent ? null : r.marksObtained }
          : r
      )
    );
    setDirtyIds((prev) => new Set(prev).add(studentId));
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      saveMarksEntry(
        test._id,
        rows
          .filter((r) => dirtyIds.has(r.studentId))
          .map((r) => ({
            studentId: r.studentId,
            marksObtained: r.marksObtained,
            isAbsent: r.isAbsent,
          }))
      ),
    onSuccess: (res) => {
      if (res.success) {
        setDirtyIds(new Set());
        queryClient.invalidateQueries({ queryKey: ['tests'] });
      } else {
        alert(res.message || 'Failed to save marks');
      }
    },
    onError: () => alert('Failed to save marks'),
  });

  const publishMutation = useMutation({
    mutationFn: () => publishTest(test._id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['tests'] });
        queryClient.invalidateQueries({ queryKey: ['marksEntry', test._id] });
      } else {
        alert(res.message || 'Failed to publish. Complete marks entry for all students first.');
      }
    },
    onError: () => alert('Failed to publish results'),
  });

  const unpublishMutation = useMutation({
    mutationFn: () => unpublishTest(test._id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['tests'] });
        queryClient.invalidateQueries({ queryKey: ['marksEntry', test._id] });
      } else {
        alert(res.message || 'Failed to unpublish');
      }
    },
    onError: () => alert('Failed to unpublish test'),
  });

  const pendingCount = useMemo(
    () => rows.filter((r) => !r.isAbsent && (r.marksObtained === null || r.marksObtained === undefined)).length,
    [rows]
  );

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to Tests
      </Button>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={1}
        sx={{ mb: 1 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Marks Entry — {test.heading}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Out of {test.totalMarks} marks • Class {test.classType}
            {test.stream ? ` • ${test.stream.name}` : ''} • {test.targetExam.name}
          </Typography>
        </Box>
        <Chip label={isPublished ? 'Published' : 'Not Published'} color={isPublished ? 'success' : 'default'} />
      </Stack>

      {isPublished ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Results are published and visible to students. Unpublish to make corrections.
        </Alert>
      ) : isBeforeTestDate ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This test is scheduled for{' '}
          {new Date(effectiveTestDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
          . You can still enter marks in advance, but results can only be published on or after that date.
        </Alert>
      ) : (
        pendingCount > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {pendingCount} student(s) still need marks before you can publish.
          </Alert>
        )
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : rows.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No students assigned yet. Go back and assign students to this test first.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#fafafa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Enrollment No.</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Marks (out of {test.totalMarks})
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Absent
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Percentage
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Rank
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.studentId} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.enrollmentNumber}</TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={row.isAbsent ? '' : row.marksObtained ?? ''}
                      onChange={(e) => handleMarksChange(row.studentId, e.target.value)}
                      disabled={row.isAbsent || isPublished}
                      inputProps={{ min: 0, max: test.totalMarks, style: { textAlign: 'center', width: 80 } }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={row.isAbsent}
                      onChange={() => handleAbsentToggle(row.studentId)}
                      disabled={isPublished}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {row.isAbsent ? '—' : row.percentage !== null ? `${row.percentage}%` : '—'}
                  </TableCell>
                  <TableCell align="center">
                    {row.isAbsent ? '—' : row.rank !== null ? `#${row.rank}` : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
        {isPublished ? (
          <Tooltip title="Reopen this test to correct marks">
            <span>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<UnpublishedIcon />}
                onClick={() => unpublishMutation.mutate()}
                disabled={unpublishMutation.isPending}
              >
                {unpublishMutation.isPending ? 'Unpublishing...' : 'Unpublish'}
              </Button>
            </span>
          </Tooltip>
        ) : (
          <>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => saveMutation.mutate()}
              disabled={dirtyIds.size === 0 || saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Saving...' : `Save Changes${dirtyIds.size ? ` (${dirtyIds.size})` : ''}`}
            </Button>
            <Tooltip
              title={
                isBeforeTestDate
                  ? 'Results can only be published on or after the test date'
                  : dirtyIds.size > 0
                  ? 'Save your changes before publishing'
                  : ''
              }
            >
              <span>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PublishIcon />}
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending || dirtyIds.size > 0 || rows.length === 0 || isBeforeTestDate}
                >
                  {publishMutation.isPending ? 'Publishing...' : 'Publish Results'}
                </Button>
              </span>
            </Tooltip>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default MarksEntryPanel;