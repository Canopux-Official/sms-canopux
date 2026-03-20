import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Box, IconButton, Switch, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, FormControlLabel, Stack, Divider,
  InputAdornment, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; 
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { StreamContainer, StreamHeader, StreamGrid, StreamCard } from './StreamPage.styles';

// Import API functions
import { getStreams, addStream, updateStream, deleteStream } from '../../api/apiFunctions';

interface IStreamUI {
  _id: string; // MongoDB uses _id
  name: string;
  isActive: boolean;
}

const StreamPage: React.FC = () => {
  const [streams, setStreams] = useState<IStreamUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', isActive: true });

  // Fetch Data
  const fetchStreams = async () => {
    const res = await getStreams();
    if (res.success && Array.isArray(res.data)) {
        setStreams(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchStreams();
    })();
  }, []);

  // --- Handlers ---
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setStreams(prev => prev.map(item => item._id === id ? { ...item, isActive: !currentStatus } : item));
    await updateStream(id, { isActive: !currentStatus });
    fetchStreams(); // Sync with server
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('⚠️ Are you sure you want to delete this stream?')) {
      const res = await deleteStream(id);
      if (res.success) {
          setStreams(prev => prev.filter(item => item._id !== id));
      } else {
          alert("Failed to delete stream");
      }
    }
  };

  const handleOpenDialog = (stream?: IStreamUI) => {
      if (stream) {
          setEditingId(stream._id);
          setFormData({ name: stream.name, isActive: stream.isActive });
      } else {
          setEditingId(null);
          setFormData({ name: '', isActive: true });
      }
      setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return alert("Stream Name is required");

    if (editingId) {
        await updateStream(editingId, formData);
    } else {
        await addStream(formData);
    }
    setOpenDialog(false);
    fetchStreams();
  };

  const filteredStreams = streams.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <StreamContainer>
      <StreamHeader>
        <Box>
          <Typography variant="h5" fontWeight="700">Stream Management</Typography>
          <Typography variant="body2" color="text.secondary">Manage academic streams.</Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
                size="small" placeholder="Search..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add Stream</Button>
        </Stack>
      </StreamHeader>

      {loading ? <CircularProgress sx={{ mt: 4, mx: 'auto', display: 'block' }} /> : (
        <StreamGrid>
            {filteredStreams.map((stream) => (
            <StreamCard key={stream._id} elevation={0} sx={{ opacity: stream.isActive ? 1 : 0.7 }}>
                <Box p={2} flexGrow={1} display="flex" alignItems="center" gap={2}>
                    <SchoolIcon color={stream.isActive ? "primary" : "disabled"} />
                    <Typography variant="h6">{stream.name}</Typography>
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between" p={1} bgcolor="#f8fafc">
                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenDialog(stream)}>Edit</Button>
                    <Box>
                        <Switch size="small" checked={stream.isActive} onChange={() => handleToggleActive(stream._id, stream.isActive)} color="success" />
                        <IconButton size="small" onClick={() => handleDelete(stream._id)}><DeleteForeverIcon fontSize="small" color="error" /></IconButton>
                    </Box>
                </Box>
            </StreamCard>
            ))}
        </StreamGrid>
      )}

      {/* Dialog Code (Same as before) */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Stream' : 'Add New Stream'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} pt={1}>
            <TextField label="Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <FormControlLabel control={<Switch checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} color="success" />} label="Active Status" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editingId ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </StreamContainer>
  );
};

export default StreamPage;