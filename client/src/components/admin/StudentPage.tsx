import { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  MenuItem, InputAdornment, TablePagination, Tooltip,
  FormControl, InputLabel, Stack, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField as MuiTextField,
  OutlinedInput, Checkbox, ListItemText,
  Box,
  CircularProgress,
  Divider,
  Select,
  LinearProgress
} from '@mui/material';

import type { SelectChangeEvent } from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Styles
import {
  PageContainer, PageHeader, FilterToolbar,
  SearchInput, FilterSelect, ActionButtonContainer
} from './StudentPage.styles';

// API
import {
  getStudents,
  addStudent,
  updateStudent,
  toggleStudentStatus,
  deleteStudent,
  bulkImportStudents,
  getActiveSubjects,
  getActiveStreams,
  getActiveTargetExams
} from '../../api/apiFunctions';

import { uploadImageToCloudinary } from '../landing_new/service/cloudinary_service';

// --- Interfaces ---

interface INamedEntity {
  _id: string;
  name: string;
}

interface IStudentUI {
  _id: string;
  name: string;
  enrollmentNumber?: string;
  profilePhoto?: string;
  phoneNumber: string;
  parentPhoneNumber: string;
  email: string;
  dob: string;
  currentClass: string;
  stream?: INamedEntity | null;
  targetExams: INamedEntity[];
  enrolledSubjects: INamedEntity[];
  academicSession: string;
  isActive: boolean;
}

interface IStudentFormData {
  name: string;
  phoneNumber: string;
  parentPhoneNumber: string;
  email: string;
  dob: string;
  currentClass: string;
  stream: string;
  targetExams: string[];
  enrolledSubjects: string[];
  academicSession: string;
  isActive: boolean;
  password?: string;
  profilePhoto?: string;
}

const CLASS_OPTIONS = ['9', '10', '11', '12', 'dropper-1', 'dropper-2'];

const StudentsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Dialogs
  const [openDialog, setOpenDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  // Import State
  const [importData, setImportData] = useState<Record<string, unknown>[]>([]);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [streamFilter, setStreamFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState<string[]>([]);
  const [examFilter, setExamFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showPassword, setShowPassword] = useState(false);

  // Upload state
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  // Queries
  const { data: studentsResponse, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents
  });

  const { data: subjectsResponse, isLoading: subjectsLoading } = useQuery({
    queryKey: ['activeSubjects'],
    queryFn: getActiveSubjects
  });

  const { data: streamsResponse, isLoading: streamsLoading } = useQuery({
    queryKey: ['activeStreams'],
    queryFn: getActiveStreams
  });

  const { data: examsResponse, isLoading: examsLoading } = useQuery({
    queryKey: ['activeTargetExams'],
    queryFn: getActiveTargetExams
  });

  // Derived Native State
  const students = useMemo(() =>
    studentsResponse?.success ? (studentsResponse.data as IStudentUI[]) : [],
    [studentsResponse]);

  const subjectOptions = useMemo(() => {
    const data = subjectsResponse?.data as { subjects: INamedEntity[] } | undefined;
    return (subjectsResponse?.success && data?.subjects) ? data.subjects.map(s => s.name) : [];
  }, [subjectsResponse]);

  const streamOptions = useMemo(() => {
    const data = streamsResponse?.data as INamedEntity[] | undefined;
    return (streamsResponse?.success && data) ? data.map(s => s.name) : [];
  }, [streamsResponse]);

  const examOptions = useMemo(() =>
    examsResponse?.success && Array.isArray(examsResponse.data) ? (examsResponse.data as INamedEntity[]).map(e => e.name) : [],
    [examsResponse]);

  const loading = studentsLoading || subjectsLoading || streamsLoading || examsLoading;

  // Form State
  const [formData, setFormData] = useState<IStudentFormData>({
    name: '', phoneNumber: '', parentPhoneNumber: '', email: '', dob: '',
    currentClass: '', stream: '', targetExams: [], enrolledSubjects: [],
    academicSession: '2024-2025', isActive: true, password: '', profilePhoto: ''
  });

  // Check if Stream is applicable (Class 11, 12, or Droppers)
  const isStreamApplicable = ['11', '12', 'dropper-1', 'dropper-2'].includes(formData.currentClass);

  // --- Handlers ---

  const handleOpenDialog = (student?: IStudentUI) => {
    if (student) {
      setEditingStudentId(student._id);

      let formattedDob = '';
      if (student.dob) {
        try {
          formattedDob = new Date(student.dob).toISOString().split('T')[0];
        } catch (e) { console.error("Invalid Date", e) }
      }

      setFormData({
        name: student.name,
        phoneNumber: student.phoneNumber,
        parentPhoneNumber: student.parentPhoneNumber || '',
        email: student.email || '',
        dob: formattedDob,
        currentClass: student.currentClass,
        stream: student.stream ? student.stream.name : '',
        targetExams: student.targetExams.map(t => t.name),
        enrolledSubjects: student.enrolledSubjects.map(s => s.name),
        academicSession: student.academicSession,
        isActive: student.isActive,
        password: '',
        profilePhoto: student.profilePhoto || ''
      });
    } else {
      setEditingStudentId(null);
      setFormData({
        name: '', phoneNumber: '', parentPhoneNumber: '',
        email: '', dob: '',
        currentClass: '', stream: '', targetExams: [], enrolledSubjects: [],
        academicSession: '2024-2025', isActive: true,
        password: '', profilePhoto: ''
      });
    }
    setShowPassword(false);
    setImageUploading(false);
    setImageUploadProgress(0);
    setOpenDialog(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    setImageUploading(true);
    setImageUploadProgress(0);
    
    try {
      const imageUrl = await uploadImageToCloudinary(file, (p) => setImageUploadProgress(p));
      setFormData(prev => ({ ...prev, profilePhoto: imageUrl }));
    } catch (err: unknown) {
      alert(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setImageUploading(false);
      setImageUploadProgress(0);
      e.target.value = '';
    }
  };

  const addStudentMutation = useMutation({
    mutationFn: (payload: IStudentFormData) => addStudent(payload),
    onSuccess: (res) => {
      if (res.success) {
        setOpenDialog(false);
        queryClient.invalidateQueries({ queryKey: ['students'] });
      } else {
        alert("Error: " + res.message);
      }
    }
  });

  const updateStudentMutation = useMutation({
    mutationFn: (params: { id: string, payload: IStudentFormData }) => updateStudent(params.id, params.payload),
    onSuccess: (res) => {
      if (res.success) {
        setOpenDialog(false);
        queryClient.invalidateQueries({ queryKey: ['students'] });
      } else {
        alert("Error: " + res.message);
      }
    }
  });

  const handleSave = async () => {
    if (
      !formData.name ||
      !formData.phoneNumber ||
      !formData.currentClass ||
      !formData.dob ||
      !formData.academicSession ||
      !formData.targetExams || formData.targetExams.length === 0
    ) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    if (isStreamApplicable && !formData.stream) {
      alert("Stream is required for the selected class.");
      return;
    }

    const payload = { ...formData };

    if (editingStudentId) {
      updateStudentMutation.mutate({ id: editingStudentId, payload });
    } else {
      addStudentMutation.mutate(payload);
    }
  };

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => toggleStudentStatus(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['students'] });
      } else {
        alert("Error: " + res.message);
      }
    }
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['students'] });
      } else {
        alert("Error deleting student: " + res.message);
      }
    }
  });

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    const action = currentStatus ? "Deactivate" : "Activate";
    if (!window.confirm(`Are you sure you want to ${action} this student?`)) {
      return;
    }
    toggleStatusMutation.mutate(id);
  };

  const handleHardDelete = (id: string) => {
    if (window.confirm('⚠️ WARNING: This will PERMANENTLY delete the student record from the database.\n\nAre you sure you want to proceed?')) {
      deleteStudentMutation.mutate(id);
    }
  };

  // --- Import Logic ---

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/Student_Import_Template.xlsx";
    link.download = "Student_Import_Template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = e.target?.result;
      if (data) {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        if (jsonData.length === 0) {
          alert("File appears to be empty.");
          return;
        }
        setImportData(jsonData);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const bulkImportMutation = useMutation({
    mutationFn: (data: Record<string, unknown>[]) => bulkImportStudents(data),
    onSuccess: (response) => {
      if (response.success) {
        const msg = (response.data as { message?: string })?.message || "Import Successful";
        alert(msg);
        handleCloseImport();
        queryClient.invalidateQueries({ queryKey: ['students'] });
      } else {
        alert("Import failed: " + response.message);
      }
    },
    onError: () => alert("Import failed due to server error")
  });

  const handleImportSubmit = () => {
    if (importData.length === 0) return;
    bulkImportMutation.mutate(importData);
  };

  const handleCloseImport = () => {
    setOpenImportDialog(false);
    setImportData([]);
    setImportFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Filter Logic Handlers ---

  const handleExamFilterChange = (event: SelectChangeEvent<unknown>) => {
    const value = event.target.value;
    setExamFilter(typeof value === 'string' ? value.split(',') : (value as string[]));
  };

  const handleSubjectFilterChange = (event: SelectChangeEvent<unknown>) => {
    const value = event.target.value;
    setSubjectFilter(typeof value === 'string' ? value.split(',') : (value as string[]));
  };

  // --- Filtering & Pagination ---

  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();

    // 1. Search (Name/Phone/Email/Enrollment Number)
    const matchesSearch =
      student.name.toLowerCase().includes(term) ||
      student.phoneNumber.includes(term) ||
      (student.email && student.email.toLowerCase().includes(term)) ||
      (student.enrollmentNumber && student.enrollmentNumber.toLowerCase().includes(term));

    // 2. Class Filter
    const matchesClass = classFilter === 'All' || student.currentClass === classFilter;

    // 3. Exam Filter
    const matchesExam = examFilter.length === 0 || examFilter.some(filter =>
      student.targetExams.some(t => t.name === filter)
    );

    // 4. Status Filter
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? student.isActive : !student.isActive);

    // 5. Stream Filter (New)
    const matchesStream = streamFilter === 'All' || (student.stream?.name === streamFilter);

    // 6. Subject Filter (New - OR logic: student has any of the selected subjects)
    const matchesSubject = subjectFilter.length === 0 || subjectFilter.some(filter =>
      student.enrolledSubjects.some(sub => sub.name === filter)
    );

    return matchesSearch && matchesClass && matchesExam && matchesStatus && matchesStream && matchesSubject;
  });

  const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleResetFilters = () => {
    setClassFilter('All');
    setStreamFilter('All');
    setExamFilter([]);
    setSubjectFilter([]);
    setStatusFilter('All');
    setSearchTerm('');
  };

  return (
    <PageContainer>
      <PageHeader>
        <Box>
          <Typography variant="h5" fontWeight="700" color="text.primary">Students Directory</Typography>
          <Typography variant="body2" color="text.secondary">Manage admissions and access.</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => setOpenImportDialog(true)}
            sx={{ backgroundColor: 'white' }}
          >
            Import Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: 'primary.main' }}
          >
            Add Student
          </Button>
        </Stack>
      </PageHeader>

      <FilterToolbar elevation={0} sx={{ flexWrap: 'wrap', gap: 2 }}>
        <SearchInput
          size="small"
          placeholder="Search Name, Phone, or Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ minWidth: 250 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Class</InputLabel>
          <FilterSelect value={classFilter} label="Class" onChange={(e) => setClassFilter(e.target.value as string)}>
            <MenuItem value="All">All</MenuItem>
            {CLASS_OPTIONS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </FilterSelect>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Stream</InputLabel>
          <FilterSelect value={streamFilter} label="Stream" onChange={(e) => setStreamFilter(e.target.value as string)}>
            <MenuItem value="All">All</MenuItem>
            {streamOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </FilterSelect>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Target Exams</InputLabel>
          <FilterSelect
            multiple
            value={examFilter}
            onChange={handleExamFilterChange}
            input={<OutlinedInput label="Target Exams" />}
            renderValue={(selected) => (selected as string[]).join(', ')}
          >
            {examOptions.map((name) => (
              <MenuItem key={name} value={name}>
                <Checkbox checked={examFilter.indexOf(name) > -1} size="small" />
                <ListItemText primary={name} />
              </MenuItem>
            ))}
          </FilterSelect>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Subjects</InputLabel>
          <FilterSelect
            multiple
            value={subjectFilter}
            onChange={handleSubjectFilterChange}
            input={<OutlinedInput label="Subjects" />}
            renderValue={(selected) => (selected as string[]).join(', ')}
          >
            {subjectOptions.map((name) => (
              <MenuItem key={name} value={name}>
                <Checkbox checked={subjectFilter.indexOf(name) > -1} size="small" />
                <ListItemText primary={name} />
              </MenuItem>
            ))}
          </FilterSelect>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <FilterSelect value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as string)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </FilterSelect>
        </FormControl>

        <Tooltip title="Reset Filters">
          <IconButton onClick={handleResetFilters}>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      </FilterToolbar>

      {/* TABLE */}
      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', bgcolor: 'white' }}>
        <TableContainer>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Enrollment Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Student Profile</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Class & Stream</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Targets</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Enrolled Subjects</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Session</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStudents.map((student) => (
                  <TableRow key={student._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {student.enrollmentNumber || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{student.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{student.phoneNumber}</Typography>
                        <Typography variant="caption" display="block" color="text.secondary">{student.email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{student.currentClass}</Typography>
                      {student.stream && <Typography variant="caption">{student.stream.name}</Typography>}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {student.targetExams.map((exam) => (
                          <Chip key={exam._id} label={exam.name} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {student.enrolledSubjects.length > 0
                          ? student.enrolledSubjects.map((s) => s.name).join(', ')
                          : 'None'}
                      </Typography>
                    </TableCell>
                    <TableCell><Chip label={student.academicSession} size="small" sx={{ bgcolor: '#f1f5f9' }} /></TableCell>
                    <TableCell>
                      <Chip label={student.isActive ? 'Active' : 'Inactive'} size="small" color={student.isActive ? 'success' : 'default'} />
                    </TableCell>

                    <TableCell align="right">
                      <ActionButtonContainer>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(student)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={student.isActive ? "Deactivate" : "Activate"}>
                          <IconButton
                            size="small"
                            color={student.isActive ? "success" : "default"}
                            onClick={() => handleToggleStatus(student._id, student.isActive)}
                          >
                            {student.isActive ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Permanently">
                          <IconButton size="small" color="error" onClick={() => handleHardDelete(student._id)}>
                            <DeleteForeverIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ActionButtonContainer>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredStudents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Box>

      {/* --- ADD / EDIT DIALOG --- */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f8fafc', fontWeight: 600 }}>
          {editingStudentId ? 'Edit Student Details' : 'Add New Student'}
        </DialogTitle>
        <DialogContent dividers>

          <Stack spacing={3} pt={1}>

            {/* Section 1: Personal Details */}
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" alignItems="center" gap={2}>
                      {formData.profilePhoto && (
                        <Box 
                          component="img" 
                          src={formData.profilePhoto} 
                          alt="Profile Preview" 
                          sx={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} 
                        />
                      )}
                      <Button 
                        variant="outlined" 
                        component="label"
                        startIcon={imageUploading ? <CircularProgress size={14} /> : <CloudUploadIcon />}
                        disabled={imageUploading}
                      >
                        {imageUploading ? `${imageUploadProgress}%` : 'Upload Profile Photo'}
                        <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
                      </Button>
                  </Box>
                  {imageUploading && (
                      <LinearProgress variant="determinate" value={imageUploadProgress} sx={{ width: 200, mt: 1, borderRadius: 1 }} />
                  )}
                </Box>
                
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                  <MuiTextField
                    label="Full Name" required fullWidth
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <MuiTextField
                    required label="Date of Birth" type="date" fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </Box>

                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                  <MuiTextField
                    label="Phone Number" required fullWidth
                    value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                  <MuiTextField
                    label="Parent Phone" fullWidth
                    value={formData.parentPhoneNumber} onChange={(e) => setFormData({ ...formData, parentPhoneNumber: e.target.value })}
                  />
                </Box>

                <MuiTextField
                  label="Email Address" fullWidth
                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <MuiTextField
                  label={editingStudentId ? "Reset Password (leave blank to keep current)" : "Password"}
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Box>

            {/* Section 2: Academic Details */}
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                Academic Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                {/* Row 1: Session, Class, Stream */}
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                  <MuiTextField
                    label="Academic Session" required fullWidth
                    value={formData.academicSession} onChange={(e) => setFormData({ ...formData, academicSession: e.target.value })}
                    sx={{ flex: 2 }}
                  />
                  <FormControl fullWidth required sx={{ flex: 1 }}>
                    <InputLabel>Class</InputLabel>
                    <Select
                      value={formData.currentClass}
                      label="Class"
                      onChange={(e) => {
                        const newClass = e.target.value as string;
                        setFormData({
                          ...formData,
                          currentClass: newClass,
                          // Reset stream if not Class 11, 12, or Dropper
                          stream: ['11', '12', 'dropper-1', 'dropper-2'].includes(newClass) ? formData.stream : ''
                        });
                      }}
                    >
                      {CLASS_OPTIONS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>

                  {/* Stream (Disabled for Class 9/10) */}
                  <FormControl
                    fullWidth
                    required={isStreamApplicable}
                    disabled={!isStreamApplicable}
                    sx={{ flex: 1 }}
                  >
                    <InputLabel>Stream</InputLabel>
                    <Select value={formData.stream} label="Stream" onChange={(e) => setFormData({ ...formData, stream: e.target.value as string })}>
                      <MenuItem value=""><em>None</em></MenuItem>
                      {streamOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>

                {/* Row 2: Targets */}
                <FormControl fullWidth required>
                  <InputLabel>Target Exams</InputLabel>
                  <Select
                    multiple
                    value={formData.targetExams}
                    onChange={(e) => setFormData({ ...formData, targetExams: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[] })}
                    input={<OutlinedInput label="Target Exams" />}
                    renderValue={(selected) => (selected as string[]).join(', ')}
                  >
                    {examOptions.map((name) => (
                      <MenuItem key={name} value={name}>
                        <Checkbox checked={(formData.targetExams || []).indexOf(name) > -1} />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Row 3: Subjects */}
                <FormControl fullWidth required>
                  <InputLabel>Enrolled Subjects</InputLabel>
                  <Select
                    multiple
                    value={formData.enrolledSubjects}
                    onChange={(e) => setFormData({ ...formData, enrolledSubjects: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[] })}
                    input={<OutlinedInput label="Enrolled Subjects" />}
                    renderValue={(selected) => (selected as string[]).join(', ')}
                  >
                    {subjectOptions.map((name) => (
                      <MenuItem key={name} value={name}>
                        <Checkbox checked={(formData.enrolledSubjects || []).indexOf(name) > -1} />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

              </Stack>
            </Box>

          </Stack>

        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, bgcolor: '#f8fafc' }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ fontWeight: 600 }}
            disabled={addStudentMutation.isPending || updateStudentMutation.isPending || imageUploading}
          >
            {addStudentMutation.isPending || updateStudentMutation.isPending ? 'Saving...' : 'Save Student'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- IMPORT DIALOG --- */}
      <Dialog open={openImportDialog} onClose={handleCloseImport} maxWidth="sm" fullWidth>
        <DialogTitle>Import Students</DialogTitle>
        <DialogContent dividers>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            hidden
            ref={fileInputRef}
            onChange={handleFileSelect}
          />

          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: importFileName ? 'success.main' : '#ccc',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: importFileName ? '#f0fff4' : '#fafafa',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: importFileName ? '#e6fffa' : '#f0f0f0', borderColor: importFileName ? 'success.dark' : '#999' }
            }}
          >
            {importFileName ? (
              <>
                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" color="success.main">File Selected</Typography>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mt={1}>
                  <InsertDriveFileIcon color="action" fontSize="small" />
                  <Typography variant="body1" fontWeight="500">{importFileName}</Typography>
                </Stack>
                <Typography variant="caption" display="block" mt={1} color="text.secondary">Click to change file</Typography>
              </>
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="h6">Click to Upload Excel File</Typography>
                <Typography variant="body2" color="text.secondary">Supported: .xlsx, .xls, .csv</Typography>
              </>
            )}
          </Box>

          <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {importData.length > 0 ? `${importData.length} records ready to import` : "Need a template?"}
            </Typography>
            <Button startIcon={<FileDownloadIcon />} size="small" onClick={handleDownloadTemplate}>
              Download Excel Template
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
          <Button onClick={handleCloseImport} color="inherit" disabled={bulkImportMutation.isPending}>Cancel</Button>
          <Button
            onClick={handleImportSubmit}
            variant="contained"
            disableElevation
            disabled={importData.length === 0 || bulkImportMutation.isPending}
            startIcon={bulkImportMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
          >
            {bulkImportMutation.isPending ? 'Importing...' : 'Upload & Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default StudentsPage;