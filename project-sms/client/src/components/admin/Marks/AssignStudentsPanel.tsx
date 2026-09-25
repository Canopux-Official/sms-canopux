import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEligibleStudents, assignStudents } from './services/marksApi';
import type { Test } from './types/types';

interface AssignStudentsPanelProps {
  test: Test;
  onBack: () => void;
  onAssigned: () => void;
}

const AssignStudentsPanel: React.FC<AssignStudentsPanelProps> = ({ test, onBack, onAssigned }) => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [initialized, setInitialized] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ['eligibleStudents', test._id],
    queryFn: () => getEligibleStudents(test._id),
  });

  const students = useMemo(() => (response?.success ? response.data || [] : []), [response]);

  useEffect(() => {
    if (!initialized && response) {
      setSelected(new Set(students.filter((s) => s.isAssigned).map((s) => s._id)));
      setInitialized(true);
    }
  }, [students, response, initialized]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const q = searchTerm.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.enrollmentNumber?.toLowerCase().includes(q)
    );
  }, [students, searchTerm]);

  const isLocked = test.status === 'published';

  const toggle = (id: string) => {
    if (isLocked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selected.has(s._id));

  const toggleAll = () => {
    if (isLocked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((s) => next.delete(s._id));
      } else {
        filtered.forEach((s) => next.add(s._id));
      }
      return next;
    });
  };

  const assignMutation = useMutation({
    mutationFn: () => assignStudents(test._id, Array.from(selected)),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['tests'] });
        onAssigned();
      } else {
        alert(res.message || 'Failed to assign students');
      }
    },
    onError: () => alert('Failed to assign students'),
  });

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to Tests
      </Button>

      <Typography variant="h6" fontWeight={700} gutterBottom>
        Assign Students — {test.heading}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Class {test.classType}
        {test.stream ? ` • ${test.stream.name}` : ''} • {test.targetExam.name}. Only students matching
        this class, stream and target exam are shown below.
      </Typography>

      {isLocked && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This test is already published. Unpublish it from the marks entry screen first if you need
          to change the assigned students.
        </Alert>
      )}

      <TextField
        fullWidth
        placeholder="Search by name or enrollment number"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No eligible students found for this class / stream / target exam.
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <Box
            sx={{
              px: 2,
              py: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #eee',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Checkbox
                checked={allFilteredSelected}
                indeterminate={!allFilteredSelected && filtered.some((s) => selected.has(s._id))}
                onChange={toggleAll}
                disabled={isLocked}
              />
              <Typography variant="body2" fontWeight={600}>
                Select All ({filtered.length})
              </Typography>
            </Stack>
            <Chip label={`${selected.size} selected`} color="primary" size="small" />
          </Box>
          <List sx={{ maxHeight: 480, overflowY: 'auto' }}>
            {filtered.map((s) => (
              <ListItem key={s._id} disablePadding>
                <ListItemButton onClick={() => toggle(s._id)} disabled={isLocked}>
                  <ListItemIcon>
                    <Checkbox edge="start" checked={selected.has(s._id)} tabIndex={-1} disableRipple />
                  </ListItemIcon>
                  <ListItemText primary={s.name} secondary={`${s.enrollmentNumber} • ${s.phoneNumber}`} />
                  {s.isAssigned && <Chip label="Assigned" size="small" color="success" variant="outlined" />}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          disabled={isLocked || assignMutation.isPending || selected.size === 0}
          onClick={() => assignMutation.mutate()}
        >
          {assignMutation.isPending ? 'Saving...' : `Assign ${selected.size} Student(s)`}
        </Button>
      </Box>
    </Box>
  );
};

export default AssignStudentsPanel;
