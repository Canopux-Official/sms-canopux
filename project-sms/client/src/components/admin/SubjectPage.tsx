import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Box, IconButton, Switch, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, FormControlLabel,  Stack, Divider,
  InputAdornment, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; 
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search'; 
import { SubjectContainer, SubjectHeader, SubjectGrid, SubjectCard } from './SubjectsPage.styles';

// Import API functions
import { getAllSubjects, addSubject, updateSubject, deleteSubject } from '../../api/apiFunctions';

interface ISubjectUI {
  _id: string;
  name: string;
  isActive: boolean;
}

interface ISubjectResponse {
  subjects: ISubjectUI[];
}

const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<ISubjectUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', isActive: true });

  const fetchSubjects = async () => {
    setLoading(true);
    const res = await getAllSubjects();
    if (res.success && res.data && (res.data as ISubjectResponse).subjects) {
        setSubjects((res.data as ISubjectResponse).subjects);
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchSubjects();
    })();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setSubjects(prev => prev.map(sub => sub._id === id ? { ...sub, isActive: !currentStatus } : sub));
    await updateSubject(id, { isActive: !currentStatus });
    fetchSubjects();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('⚠️ Delete this subject?')) {
      await deleteSubject(id);
      setSubjects(prev => prev.filter(sub => sub._id !== id));
    }
  };

  const handleOpenDialog = (subject?: ISubjectUI) => {
      if (subject) {
          setEditingId(subject._id);
          setFormData({ name: subject.name, isActive: subject.isActive });
      } else {
          setEditingId(null);
          setFormData({ name: '', isActive: true });
      }
      setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return alert("Subject Name is required");
    if (editingId) {
        await updateSubject(editingId, formData);
    } else {
        await addSubject(formData);
    }
    setOpenDialog(false);
    fetchSubjects();
  };

  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SubjectContainer>
      <SubjectHeader>
        <Box>
          <Typography variant="h5" fontWeight="700">Subject Management</Typography>
          <Typography variant="body2" color="text.secondary">Define available subjects.</Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
                size="small" placeholder="Search..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add Subject</Button>
        </Stack>
      </SubjectHeader>

      {loading ? <CircularProgress sx={{ mt: 4, mx: 'auto', display: 'block' }} /> : (
        <SubjectGrid>
            {filteredSubjects.map((subject) => (
            <SubjectCard key={subject._id} elevation={0} sx={{ opacity: subject.isActive ? 1 : 0.7 }}>
                <Box p={2} flexGrow={1} display="flex" alignItems="center" gap={2}>
                    <LibraryBooksIcon color={subject.isActive ? "primary" : "disabled"} />
                    <Typography variant="h6">{subject.name}</Typography>
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between" p={1} bgcolor="#f8fafc">
                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenDialog(subject)}>Edit</Button>
                    <Box>
                        <Switch size="small" checked={subject.isActive} onChange={() => handleToggleActive(subject._id, subject.isActive)} color="success" />
                        <IconButton size="small" onClick={() => handleDelete(subject._id)}><DeleteForeverIcon fontSize="small" color="error" /></IconButton>
                    </Box>
                </Box>
            </SubjectCard>
            ))}
        </SubjectGrid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} pt={1}>
            <TextField label="Subject Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <FormControlLabel control={<Switch checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} color="success" />} label="Active Status" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editingId ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </SubjectContainer>
  );
};

export default SubjectsPage;