


import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';

interface TargetExam {
  _id: string;
  name: string;
  description?: string;
}

interface Stream {
  _id: string;
  name: string;
  description?: string;
}

interface EditClassDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (classType: string, targetExamId: string, streamId: string) => void;
  initialClassType: string;
  initialTargetExamId: string;
  initialStreamId: string;
  targetExams: TargetExam[];
  streams: Stream[];
}

const CLASS_OPTIONS = [
  { value: '9', label: 'Class 9' },
  { value: '10', label: 'Class 10' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' },
  { value: 'dropper-1', label: 'Dropper 1' },
  { value: 'dropper-2', label: 'Dropper 2' },
];

const EditClassDialog: React.FC<EditClassDialogProps> = ({
  open,
  onClose,
  onSave,
  initialClassType,
  initialTargetExamId,
  initialStreamId,
  targetExams,
  streams,
}) => {
  const [selectedClassType, setSelectedClassType] = useState<string>('');
  const [selectedTargetExamId, setSelectedTargetExamId] = useState<string>('');
  const [selectedStreamId, setSelectedStreamId] = useState<string>('');

  // Initialize form values when dialog opens or initial values change
  useEffect(() => {
    if (open) {
      // Find the class option value that matches the initial class type
      const classOption = CLASS_OPTIONS.find(opt => opt.label === initialClassType);
      setSelectedClassType(classOption?.value || initialClassType);
      setSelectedTargetExamId(initialTargetExamId);
      setSelectedStreamId(initialStreamId);
    }
  }, [open, initialClassType, initialTargetExamId, initialStreamId]);

  const handleClassTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedClassType(event.target.value);
  };

  const handleTargetExamChange = (event: SelectChangeEvent<string>) => {
    setSelectedTargetExamId(event.target.value);
  };

  const handleStreamChange = (event: SelectChangeEvent<string>) => {
    setSelectedStreamId(event.target.value);
  };

  const handleSave = () => {
    const selectedOption = CLASS_OPTIONS.find(opt => opt.value === selectedClassType);
    const className = selectedOption?.value || selectedClassType;
    
    onSave(className, selectedTargetExamId, selectedStreamId);
  };

  const isFormValid = selectedClassType && selectedTargetExamId

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
        Edit Class
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Class</InputLabel>
          <Select
            value={selectedClassType}
            label="Class"
            onChange={handleClassTypeChange}
            sx={{ borderRadius: '10px' }}
          >
            {CLASS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Target Exam</InputLabel>
          <Select
            value={selectedTargetExamId}
            label="Target Exam"
            onChange={handleTargetExamChange}
            sx={{ borderRadius: '10px' }}
            disabled={targetExams.length === 0}
          >
            {targetExams.map((exam) => (
              <MenuItem key={exam._id} value={exam._id}>
                {exam.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedClassType === '9' || selectedClassType === '10' ? null : (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Stream</InputLabel>
          <Select
            value={selectedStreamId}
            label="Stream"
            onChange={handleStreamChange}
            sx={{ borderRadius: '10px' }}
            disabled={streams.length === 0}
          >
            {streams.map((stream) => (
              <MenuItem key={stream._id} value={stream._id}>
                {stream.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        )}

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: '#f5f5f5',
            borderRadius: '10px',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Update the class details. Changes will be saved immediately.
          </Typography>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!isFormValid}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textTransform: 'none',
            borderRadius: '8px',
            px: 3,
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditClassDialog;