import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Box, IconButton, Switch, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, FormControlLabel, Stack, Divider,
  InputAdornment, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QuizIcon from '@mui/icons-material/Quiz'; 
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; 
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { ExamContainer, ExamHeader, ExamGrid, ExamCard } from './TargetExamPage.styles';

// Import API functions
import { getTargetExams, addTargetExam, updateTargetExam, deleteTargetExam } from '../../api/apiFunctions';

interface IExamUI {
  _id: string;
  name: string;
  isActive: boolean;
}

const TargetExamPage: React.FC = () => {
  const [exams, setExams] = useState<IExamUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', isActive: true });

  const fetchExams = async () => {
    try {
      const res = await getTargetExams();
      if (res.success && Array.isArray(res.data)) {
          setExams(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setExams(prev => prev.map(item => item._id === id ? { ...item, isActive: !currentStatus } : item));
    await updateTargetExam(id, { isActive: !currentStatus });
    fetchExams();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('⚠️ Delete this Exam?')) {
      await deleteTargetExam(id);
      setExams(prev => prev.filter(item => item._id !== id));
    }
  };

  const handleOpenDialog = (exam?: IExamUI) => {
      if (exam) {
          setEditingId(exam._id);
          setFormData({ name: exam.name, isActive: exam.isActive });
      } else {
          setEditingId(null);
          setFormData({ name: '', isActive: true });
      }
      setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return alert("Name required");
    if (editingId) {
        await updateTargetExam(editingId, formData);
    } else {
        await addTargetExam(formData);
    }
    setOpenDialog(false);
    fetchExams();
  };

  const filteredExams = exams.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <ExamContainer>
      <ExamHeader>
        <Box>
          <Typography variant="h5" fontWeight="700">Target Exams</Typography>
          <Typography variant="body2" color="text.secondary">Manage entrance exams.</Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
                size="small" placeholder="Search..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add Exam</Button>
        </Stack>
      </ExamHeader>

      {loading ? <CircularProgress sx={{ mt: 4, mx: 'auto', display: 'block' }} /> : (
        <ExamGrid>
            {filteredExams.map((exam) => (
            <ExamCard key={exam._id} elevation={0} sx={{ opacity: exam.isActive ? 1 : 0.7 }}>
                <Box p={2} flexGrow={1} display="flex" alignItems="center" gap={2}>
                    <QuizIcon color={exam.isActive ? "primary" : "disabled"} />
                    <Typography variant="h6">{exam.name}</Typography>
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between" p={1} bgcolor="#f8fafc">
                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenDialog(exam)}>Edit</Button>
                    <Box>
                        <Switch size="small" checked={exam.isActive} onChange={() => handleToggleActive(exam._id, exam.isActive)} color="success" />
                        <IconButton size="small" onClick={() => handleDelete(exam._id)}><DeleteForeverIcon fontSize="small" color="error" /></IconButton>
                    </Box>
                </Box>
            </ExamCard>
            ))}
        </ExamGrid>
      )}

      {/* Reused Dialog Logic */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Exam' : 'Add New Exam'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} pt={1}>
            <TextField label="Exam Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <FormControlLabel control={<Switch checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} color="success" />} label="Active Status" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editingId ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </ExamContainer>
  );
};

export default TargetExamPage;