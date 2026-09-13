import React, { useMemo, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getStreams, getTargetExams } from '../../api/apiFunctions';
import { getAllTests, createTest, updateTest, deleteTest } from '../../components/admin/Marks/services/marksApi';
import TestModal from '../../components/admin/Marks/modals/TestModal';
import AssignStudentsPanel from '../../components/admin/Marks/AssignStudentsPanel';
import MarksEntryPanel from '../../components/admin/Marks/MarksEntryPanel';
import type { Test, TestFormData, INamedEntity } from '../../components/admin/Marks/types/types';

type View = { mode: 'list' } | { mode: 'assign'; test: Test } | { mode: 'entry'; test: Test };

const CLASS_OPTIONS = ['9', '10', '11', '12', 'dropper-1', 'dropper-2'];

const AdminMarks: React.FC = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>({ mode: 'list' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: testsResponse, isLoading: testsLoading } = useQuery({
    queryKey: ['tests'],
    queryFn: getAllTests,
  });

  const { data: streamsResponse } = useQuery({ queryKey: ['streams'], queryFn: getStreams });
  const { data: examsResponse } = useQuery({ queryKey: ['targetExams'], queryFn: getTargetExams });

  const tests = useMemo(() => (testsResponse?.success ? testsResponse.data || [] : []), [testsResponse]);
  const streams = useMemo(() => (streamsResponse?.data as INamedEntity[]) || [], [streamsResponse]);
  const targetExams = useMemo(() => (examsResponse?.data as INamedEntity[]) || [], [examsResponse]);

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchesSearch =
        !searchTerm.trim() ||
        t.heading.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.targetExam?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = classFilter === 'All' || t.classType === classFilter;
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [tests, searchTerm, classFilter, statusFilter]);

  const showSnackbar = (message: string, severity: 'success' | 'error') =>
    setSnackbar({ open: true, message, severity });

  const createMutation = useMutation({
    mutationFn: (data: TestFormData) => createTest(data),
    onSuccess: (res) => {
      if (res.success) {
        setModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['tests'] });
        showSnackbar('Test created successfully', 'success');
      } else {
        showSnackbar(res.message || 'Failed to create test', 'error');
      }
    },
    onError: () => showSnackbar('Failed to create test', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (params: { id: string; data: TestFormData }) => updateTest(params.id, params.data),
    onSuccess: (res) => {
      if (res.success) {
        setModalOpen(false);
        setEditingTest(null);
        queryClient.invalidateQueries({ queryKey: ['tests'] });
        showSnackbar('Test updated successfully', 'success');
      } else {
        showSnackbar(res.message || 'Failed to update test', 'error');
      }
    },
    onError: () => showSnackbar('Failed to update test', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTest(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['tests'] });
        showSnackbar('Test deleted successfully', 'success');
      } else {
        showSnackbar(res.message || 'Failed to delete test', 'error');
      }
    },
    onError: () => showSnackbar('Failed to delete test', 'error'),
  });

  const handleOpenCreate = () => {
    setEditingTest(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (test: Test) => {
    setEditingTest(test);
    setModalOpen(true);
  };

  const handleDelete = (test: Test) => {
    if (window.confirm(`Delete "${test.heading}"? This will remove all associated results and cannot be undone.`)) {
      deleteMutation.mutate(test._id);
    }
  };

  const handleSubmit = (data: TestFormData) => {
    if (editingTest) {
      updateMutation.mutate({ id: editingTest._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const statusColor = (status: string) => (status === 'published' ? 'success' : status === 'scheduled' ? 'info' : 'default');

  if (view.mode === 'assign') {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <AssignStudentsPanel
          test={view.test}
          onBack={() => setView({ mode: 'list' })}
          onAssigned={() => setView({ mode: 'entry', test: view.test })}
        />
      </Container>
    );
  }

  if (view.mode === 'entry') {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <MarksEntryPanel test={view.test} onBack={() => setView({ mode: 'list' })} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Marks & Exams
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create tests, assign eligible students and publish results.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Create Test
        </Button>
      </Box>

      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <TextField
          placeholder="Search tests..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Class</InputLabel>
          <Select value={classFilter} label="Class" onChange={(e) => setClassFilter(e.target.value)}>
            <MenuItem value="All">All Classes</MenuItem>
            {CLASS_OPTIONS.map((c) => (
              <MenuItem key={c} value={c}>
                Class {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="published">Published</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {testsLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : filteredTests.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary">No tests found. Create your first test to get started.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#fafafa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Test</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Class / Stream / Exam</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Test Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assigned</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test._id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{test.heading}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Out of {test.totalMarks} marks
                    </Typography>
                  </TableCell>
                  <TableCell>
                    Class {test.classType}
                    {test.stream ? ` • ${test.stream.name}` : ''} • {test.targetExam?.name}
                  </TableCell>
                  <TableCell>{new Date(test.testDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {test.assignedCount || 0} students
                    {(test.assignedCount || 0) > 0 && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {test.enteredCount || 0}/{test.assignedCount} marks entered
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={test.status} color={statusColor(test.status)} size="small" sx={{ textTransform: 'capitalize' }} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Assign Students">
                      <IconButton size="small" onClick={() => setView({ mode: 'assign', test })}>
                        <GroupAddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Enter / View Marks">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => setView({ mode: 'entry', test })}
                          disabled={(test.assignedCount || 0) === 0}
                        >
                          <AssignmentIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Edit Test">
                      <IconButton size="small" onClick={() => handleOpenEdit(test)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Test">
                      <IconButton size="small" color="error" onClick={() => handleDelete(test)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TestModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTest(null);
        }}
        onSubmit={handleSubmit}
        test={editingTest}
        streams={streams}
        targetExams={targetExams}
        submitting={createMutation.isPending || updateMutation.isPending}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminMarks;
