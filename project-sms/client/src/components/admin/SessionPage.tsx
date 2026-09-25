/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import {
  Typography, Button, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Checkbox,
  Select, MenuItem, FormControl, InputLabel, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, IconButton, Tooltip, TextField,
  OutlinedInput, ListItemText, InputAdornment, TablePagination,
  Paper, LinearProgress, Alert,
  CircularProgress
} from '@mui/material';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// API
import {
  getStudents, updateStudent, getStreams, getTargetExams, getAllSubjects
} from '../../api/apiFunctions';

// --- Types ---
type PromotionStatus = 'Promote' | 'ToDropper' | 'Retain' | 'Discontinue';

interface IStudentSessionUI {
  _id: string;
  name: string;
  enrollmentNumber?: string;
  phoneNumber: string;
  currentClass: string;
  stream: string;
  academicSession: string;
  targetExams: string[];
  enrolledSubjects: string[];
  nextAction: PromotionStatus;
  nextClass: string;
  nextStream?: string;
}

// --- Logic Helpers ---

// Validates format "YYYY-YYYY" and logic (End = Start + 1)
const validateSessionString = (session: string): { isValid: boolean; error?: string } => {
  const regex = /^\d{4}-\d{4}$/;
  if (!regex.test(session)) {
    return { isValid: false, error: "Format must be YYYY-YYYY (e.g. 2024-2025)" };
  }

  const [start, end] = session.split('-').map(Number);

  if (end <= start) {
    return { isValid: false, error: "End year must be greater than start year." };
  }

  if (end - start !== 1) {
    return { isValid: false, error: "Standard sessions must be 1 year long." };
  }

  return { isValid: true };
};

// Calculates the next class based on current class and action
const calculateNextClass = (currentClass: string, action: PromotionStatus): string => {
  if (action === 'Retain') return currentClass;
  if (action === 'Discontinue') return 'Inactive';

  // Logic for taking a drop
  if (action === 'ToDropper') {
    if (currentClass === '12') return 'dropper-1';
    if (currentClass === 'dropper-1') return 'dropper-2';
    return currentClass; // Fallback
  }

  // Logic for Promotion
  switch (currentClass) {
    case '9': return '10';
    case '10': return '11';
    case '11': return '12';
    case '12': return 'graduated';
    case 'dropper-1': return 'graduated';
    case 'dropper-2': return 'graduated';
    default: return 'graduated';
  }
};

const SessionPage: React.FC = () => {
  // --- State ---
  const [fromSession, setFromSession] = useState('2024-2025');
  const [toSession, setToSession] = useState('2025-2026');

  // Validation State for UI feedback
  const [sessionErrors, setSessionErrors] = useState<{ from?: string; to?: string }>({});

  const [targetBatchClass, setTargetBatchClass] = useState('11');

  // Data
  const [allStudents, setAllStudents] = useState<IStudentSessionUI[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<IStudentSessionUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Dropdown Options
  const [streamOptions, setStreamOptions] = useState<string[]>([]);
  const [examOptions, setExamOptions] = useState<string[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);

  // Selection & Filters
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Customization Dialog
  const [openCustomize, setOpenCustomize] = useState(false);
  const [customizingId, setCustomizingId] = useState<string | null>(null);
  const [tempProfile, setTempProfile] = useState({
    stream: '',
    subjects: [] as string[],
    exams: [] as string[]
  });

  const canMoveToDropper = ['12', 'dropper-1'].includes(targetBatchClass);

  // --- Validation Effects ---
  useEffect(() => {
    // Real-time validation for UI feedback
    const fromCheck = validateSessionString(fromSession);
    const toCheck = validateSessionString(toSession);

    setSessionErrors({
      from: fromCheck.isValid ? undefined : fromCheck.error,
      to: toCheck.isValid ? undefined : toCheck.error
    });
  }, [fromSession, toSession]);

  // --- Data Fetching ---
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, streamsRes, examsRes, subRes] = await Promise.all([
        getStudents(),
        getStreams(),
        getTargetExams(),
        getAllSubjects()
      ]);

      if (studentsRes.success && Array.isArray(studentsRes.data)) {
        const uiData: IStudentSessionUI[] = (studentsRes.data as any[]).map(s => ({
          _id: s._id,
          name: s.name,
          enrollmentNumber: s.enrollmentNumber,
          phoneNumber: s.phoneNumber,
          currentClass: s.currentClass,
          academicSession: s.academicSession,
          stream: s.stream?.name || '',
          targetExams: s.targetExams?.map((t: any) => t.name) || [],
          enrolledSubjects: s.enrolledSubjects?.map((sub: any) => sub.name) || [],
          // Defaults
          nextAction: 'Promote',
          nextClass: calculateNextClass(s.currentClass, 'Promote'),
          nextStream: s.stream?.name || ''
        }));
        setAllStudents(uiData);
      }

      if (streamsRes.success && Array.isArray(streamsRes.data)) {
        setStreamOptions(streamsRes.data.map((s: any) => s.name));
      }
      if (examsRes.success && Array.isArray(examsRes.data)) {
        setExamOptions(examsRes.data.map((e: any) => e.name));
      }
      if (subRes.success && (subRes.data as any).subjects) {
        setSubjectOptions((subRes.data as any).subjects.map((s: any) => s.name));
      }

    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Effects ---
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    const filterData = () => {
      let temp = allStudents.filter(s =>
        s.currentClass === targetBatchClass &&
        s.academicSession === fromSession
      );

      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        temp = temp.filter(s =>
          s.name.toLowerCase().includes(lower) ||
          s.phoneNumber.includes(lower)
        );
      }

      if (statusFilter !== 'All') {
        temp = temp.filter(s => s.nextAction === statusFilter);
      }

      setFilteredStudents(temp);
    };

    filterData();
  }, [allStudents, targetBatchClass, fromSession, searchTerm, statusFilter]);

  // --- Handlers ---
  const handleActionChange = (id: string, newAction: PromotionStatus) => {
    setAllStudents(prev => prev.map(s => {
      if (s._id === id) {
        return {
          ...s,
          nextAction: newAction,
          nextClass: calculateNextClass(s.currentClass, newAction)
        };
      }
      return s;
    }));
  };

  const handleBulkAction = (action: PromotionStatus) => {
    setAllStudents(prev => prev.map(s => {
      if (selectedIds.includes(s._id)) {
        return {
          ...s,
          nextAction: action,
          nextClass: calculateNextClass(s.currentClass, action)
        };
      }
      return s;
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(filteredStudents.map(s => s._id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const openCustomization = (student: IStudentSessionUI) => {
    setCustomizingId(student._id);
    setTempProfile({
      stream: student.nextStream || student.stream,
      subjects: [...student.enrolledSubjects],
      exams: [...student.targetExams]
    });
    setOpenCustomize(true);
  };

  const saveCustomization = () => {
    if (customizingId) {
      setAllStudents(prev => prev.map(s =>
        s._id === customizingId ? {
          ...s,
          nextStream: tempProfile.stream,
          enrolledSubjects: tempProfile.subjects,
          targetExams: tempProfile.exams
        } : s
      ));
    }
    setOpenCustomize(false);
  };

  // --- COMMIT & VALIDATION ---
  const handleCommit = async () => {
    const fromCheck = validateSessionString(fromSession);
    const toCheck = validateSessionString(toSession);

    if (!fromCheck.isValid) return alert(`Current Session Error: ${fromCheck.error}`);
    if (!toCheck.isValid) return alert(`Next Session Error: ${toCheck.error}`);

    const fromStartYear = parseInt(fromSession.split('-')[0]);
    const toStartYear = parseInt(toSession.split('-')[0]);

    if (toStartYear <= fromStartYear) {
      return alert("Validation Error: Next Session year must be greater than Current Session year.");
    }

    const fromEndYear = parseInt(fromSession.split('-')[1]);
    if (toStartYear !== fromEndYear) {
      if (!window.confirm(`Warning: There is a gap or overlap between sessions.\nCurrent ends: ${fromEndYear}\nNext starts: ${toStartYear}\n\nAre you sure this is correct?`)) {
        return;
      }
    }

    const studentsToProcess = allStudents.filter(s => selectedIds.includes(s._id));

    if (studentsToProcess.length === 0) return alert("No students selected.");

    const missingStream = studentsToProcess.find(s =>
      s.currentClass === '10' && s.nextAction === 'Promote' && !s.nextStream && !s.stream
    );
    if (missingStream) {
      return alert(`Error: ${missingStream.name} is moving to Class 11 but has no Stream assigned.`);
    }

    if (!window.confirm(`Update ${studentsToProcess.length} student records from ${fromSession} to ${toSession}?\n\nNote: Students promoted to 'graduated' will be marked Inactive.`)) {
      return;
    }

    setProcessing(true);
    setProgress(0);
    let completed = 0;
    const errors: string[] = [];

    for (const student of studentsToProcess) {
      try {
        const payload: any = {
          academicSession: toSession,
        };

        if (student.nextAction === 'Promote' || student.nextAction === 'ToDropper') {
          payload.currentClass = student.nextClass;
          if (student.nextStream) payload.stream = student.nextStream;
          payload.enrolledSubjects = student.enrolledSubjects;
          payload.targetExams = student.targetExams;

          if (student.nextClass === 'graduated') {
            payload.isActive = false;
          }
        }
        else if (student.nextAction === 'Discontinue') {
          payload.isActive = false;
        }

        await updateStudent(student._id, payload);

      } catch (err) {
        console.error(err);
        errors.push(student.name);
      }

      completed++;
      setProgress((completed / studentsToProcess.length) * 100);
    }

    setProcessing(false);
    if (errors.length > 0) {
      alert(`Completed with errors: ${errors.join(', ')}`);
    } else {
      alert("Updates successful!");
      fetchInitialData();
      setSelectedIds([]);
    }
  };

  const paginatedData = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>

      <Box mb={3}>
        <Typography variant="h5" fontWeight="700">Session & Promotion Manager</Typography>
        <Typography variant="body2" color="text.secondary">Upgrade batches and roll over academic sessions.</Typography>
      </Box>

      {/* 1. Control Panel */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'stretch', md: 'flex-start' }}>

          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems="center" flex={1}>
            <TextField
              label="Current Session"
              value={fromSession}
              onChange={(e) => setFromSession(e.target.value)}
              size="small"
              fullWidth
              error={!!sessionErrors.from}
              helperText={sessionErrors.from}
            />
            <Box pt={{ sm: 1 }} display={{ xs: 'none', sm: 'block' }}>
              <ArrowForwardIcon color="action" />
            </Box>
            <TextField
              label="Next Session"
              value={toSession}
              onChange={(e) => setToSession(e.target.value)}
              size="small"
              fullWidth
              error={!!sessionErrors.to}
              helperText={sessionErrors.to}
            />
          </Box>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 200 } }}>
            <InputLabel>Target Batch</InputLabel>
            <Select
              value={targetBatchClass}
              label="Target Batch"
              onChange={(e) => { setTargetBatchClass(e.target.value); setPage(0); setSelectedIds([]); }}
            >
              <MenuItem value="9">Class 9 Batch</MenuItem>
              <MenuItem value="10">Class 10 Batch</MenuItem>
              <MenuItem value="11">Class 11 Batch</MenuItem>
              <MenuItem value="12">Class 12 Batch</MenuItem>
              <MenuItem value="dropper-1">Dropper-1 Batch</MenuItem>
              <MenuItem value="dropper-2">Dropper-2 Batch</MenuItem>
            </Select>
          </FormControl>

        </Stack>
      </Paper>

      {/* 2. Actions & Filters */}
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', lg: 'center' }}
        spacing={2}
        mb={2}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            size="small"
            placeholder="Search Name..."
            value={searchTerm}
            fullWidth
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />
          <FormControl size="small" fullWidth sx={{ minWidth: 150 }}>
            <InputLabel>Planned Action</InputLabel>
            <Select value={statusFilter} label="Planned Action" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Promote">Promote / Grad</MenuItem>
              {canMoveToDropper && <MenuItem value="ToDropper">To Dropper</MenuItem>}
              <MenuItem value="Retain">Retain</MenuItem>
              <MenuItem value="Discontinue">Discontinue</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button fullWidth variant="outlined" color="success" size="small" onClick={() => handleBulkAction('Promote')} disabled={selectedIds.length === 0}>
            Set Promote
          </Button>
          {canMoveToDropper && (
            <Button fullWidth variant="outlined" color="secondary" size="small" onClick={() => handleBulkAction('ToDropper')} disabled={selectedIds.length === 0}>
              Set To Dropper
            </Button>
          )}
          <Button
            fullWidth
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleCommit}
            disabled={selectedIds.length === 0 || processing || !!sessionErrors.from || !!sessionErrors.to}
          >
            Confirm Updates
          </Button>
        </Stack>
      </Stack>

      {processing && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" align="center" display="block">Processing Updates...</Typography>
        </Box>
      )}

      {/* 3. Main Table & Pagination Wrapper */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <TableContainer sx={{ flexGrow: 1, overflowX: 'auto' }}>
          {/* minWidth strictly goes on the Table to force horizontal scroll within the container */}
          <Table stickyHeader size="small" sx={{ minWidth: 800 }}>
            <TableHead sx={{ '& th': { bgcolor: '#f8fafc', fontWeight: 700 } }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length === filteredStudents.length}
                    indeterminate={selectedIds.length > 0 && selectedIds.length < filteredStudents.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
                <TableCell>Enrollment Number</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Current Status</TableCell>
                <TableCell>Next Action</TableCell>
                <TableCell>Next Class</TableCell>
                <TableCell>Config (Next Session)</TableCell>
                <TableCell align="right">Edit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center"><CircularProgress /></TableCell></TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">No students found for this batch/session.</TableCell></TableRow>
              ) : (
                paginatedData.map((student) => {
                  const isSelected = selectedIds.includes(student._id);
                  const needsStream = student.currentClass === '10' && student.nextAction === 'Promote' && !student.nextStream && !student.stream;
                  const isDropperEligible = ['12', 'dropper-1'].includes(student.currentClass);

                  return (
                    <TableRow key={student._id} selected={isSelected} hover>
                      <TableCell padding="checkbox">
                        <Checkbox checked={isSelected} onChange={() => handleSelectOne(student._id)} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="primary.main">
                          {student.enrollmentNumber || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>{student.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{student.phoneNumber}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={`Class ${student.currentClass}`} size="small" variant="outlined" />
                        {student.stream && <Typography variant="caption" display="block">{student.stream}</Typography>}
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={student.nextAction}
                          onChange={(e) => handleActionChange(student._id, e.target.value as PromotionStatus)}
                          sx={{ fontSize: '0.8125rem', py: 0, height: 30, minWidth: 120 }}
                        >
                          <MenuItem value="Promote">{['12', 'dropper-1', 'dropper-2'].includes(student.currentClass) ? 'Graduate' : 'Promote'}</MenuItem>
                          <MenuItem value="Retain">Retain</MenuItem>
                          {isDropperEligible && <MenuItem value="ToDropper">To Dropper</MenuItem>}
                          <MenuItem value="Discontinue">Discontinue</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <ArrowForwardIcon fontSize="small" color="action" />
                          <Typography fontWeight={700} color={student.nextClass === 'graduated' ? 'text.secondary' : 'primary'}>
                            {student.nextClass}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {(student.nextAction === 'Promote' || student.nextAction === 'ToDropper') && student.nextClass !== 'graduated' && (
                          <Box>
                            {needsStream ? (
                              <Chip label="Stream Missing!" color="error" size="small" icon={<ErrorOutlineIcon />} />
                            ) : (
                              student.nextStream && <Chip label={student.nextStream} size="small" sx={{ mr: 0.5 }} />
                            )}
                            <Typography variant="caption" color="text.secondary" display="block">
                              {student.targetExams.join(', ')}
                            </Typography>
                          </Box>
                        )}
                        {student.nextClass === 'graduated' && <Chip label="Inactive" size="small" />}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Customize for Next Session">
                          <IconButton size="small" color="primary" onClick={() => openCustomization(student)}>
                            <AltRouteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredStudents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          sx={{ borderTop: '1px solid #e0e0e0' }}
          labelRowsPerPage={<Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Rows per page:</Box>}
        />
      </Paper>

      {/* Dialog remains unchanged */}
      <Dialog open={openCustomize} onClose={() => setOpenCustomize(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e0e0e0' }}>
          Configuring for Next Session ({toSession})
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <Alert severity="info" icon={<CheckCircleIcon />}>
              Changes made here will only apply when you click "Confirm Updates" on the main screen.
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Stream (Next Session)</InputLabel>
              <Select
                value={tempProfile.stream}
                label="Stream (Next Session)"
                onChange={(e) => setTempProfile({ ...tempProfile, stream: e.target.value })}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {streamOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Target Exams</InputLabel>
              <Select
                multiple
                value={tempProfile.exams}
                onChange={(e) => setTempProfile({ ...tempProfile, exams: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[] })}
                input={<OutlinedInput label="Target Exams" />}
                renderValue={(selected) => (selected as string[]).join(', ')}
              >
                {examOptions.map((name) => (
                  <MenuItem key={name} value={name}><Checkbox checked={tempProfile.exams.indexOf(name) > -1} /><ListItemText primary={name} /></MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Enrolled Subjects</InputLabel>
              <Select
                multiple
                value={tempProfile.subjects}
                onChange={(e) => setTempProfile({ ...tempProfile, subjects: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[] })}
                input={<OutlinedInput label="Enrolled Subjects" />}
                renderValue={(selected) => (selected as string[]).join(', ')}
              >
                {subjectOptions.map((name) => (
                  <MenuItem key={name} value={name}><Checkbox checked={tempProfile.subjects.indexOf(name) > -1} /><ListItemText primary={name} /></MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setOpenCustomize(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveCustomization}>Save Configuration</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default SessionPage;