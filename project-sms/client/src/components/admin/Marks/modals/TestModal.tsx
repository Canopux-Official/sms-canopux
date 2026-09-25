import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  FormControl,
  InputLabel,
  Select,
  Alert,
  type SelectChangeEvent,
} from '@mui/material';
import type { Test, TestFormData, INamedEntity } from '../types/types';

interface TestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TestFormData) => void;
  test?: Test | null;
  streams: INamedEntity[];
  targetExams: INamedEntity[];
  submitting?: boolean;
}

const CLASS_OPTIONS = ['9', '10', '11', '12', 'dropper-1', 'dropper-2'];
const STREAM_REQUIRED_CLASSES = ['11', '12', 'dropper-1', 'dropper-2'];

const emptyForm: TestFormData = {
  heading: '',
  description: '',
  totalMarks: '',
  testDate: '',
  classType: '',
  stream: '',
  targetExam: '',
};

const TestModal: React.FC<TestModalProps> = ({
  open,
  onClose,
  onSubmit,
  test,
  streams,
  targetExams,
  submitting,
}) => {
  const [formData, setFormData] = useState<TestFormData>(emptyForm);

  // Once a test moves past 'draft', students have already been filtered/assigned
  // against its class/stream/exam/totalMarks — those fields are locked server-side too.
  const isLocked = !!test && test.status !== 'draft';

  useEffect(() => {
    if (test) {
      setFormData({
        heading: test.heading,
        description: test.description || '',
        totalMarks: test.totalMarks,
        testDate: test.testDate ? new Date(test.testDate).toISOString().split('T')[0] : '',
        classType: test.classType,
        stream: test.stream?._id || '',
        targetExam: test.targetExam?._id || '',
      });
    } else {
      setFormData(emptyForm);
    }
  }, [test, open]);

  const isStreamApplicable = STREAM_REQUIRED_CLASSES.includes(formData.classType);

  const handleClassChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      classType: value,
      stream: STREAM_REQUIRED_CLASSES.includes(value) ? prev.stream : '',
    }));
  };

  const handleSubmit = () => onSubmit(formData);

  const isValid =
    formData.heading.trim().length > 0 &&
    formData.totalMarks !== '' &&
    Number(formData.totalMarks) > 0 &&
    !!formData.testDate &&
    !!formData.classType &&
    !!formData.targetExam &&
    (!isStreamApplicable || !!formData.stream);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{test ? 'Edit Test' : 'Create Test'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {isLocked && (
            <Alert severity="info">
              Students are already assigned to this test, so class, stream, target exam and total
              marks are locked. You can still update the name, description and test date.
            </Alert>
          )}

          <TextField
            label="Test Name (e.g. Physics Unit Test 1)"
            value={formData.heading}
            onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
            fullWidth
            required
            helperText="The name doubles as the subject — name it clearly, e.g. 'Chemistry Monthly Test'."
          />

          <TextField
            label="Description / Syllabus (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            minRows={3}
            helperText="Shown to students on their Marks page — e.g. chapters covered, exam pattern, instructions."
          />

          <TextField
            label="Test Date"
            type="date"
            value={formData.testDate}
            onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Total Marks"
            type="number"
            value={formData.totalMarks}
            onChange={(e) =>
              setFormData({ ...formData, totalMarks: e.target.value === '' ? '' : Number(e.target.value) })
            }
            fullWidth
            required
            disabled={isLocked}
            inputProps={{ min: 1 }}
          />

          <FormControl fullWidth required disabled={isLocked}>
            <InputLabel>Class</InputLabel>
            <Select value={formData.classType} label="Class" onChange={handleClassChange}>
              {CLASS_OPTIONS.map((c) => (
                <MenuItem key={c} value={c}>
                  Class {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required={isStreamApplicable} disabled={isLocked || !isStreamApplicable}>
            <InputLabel>Stream</InputLabel>
            <Select
              value={formData.stream}
              label="Stream"
              onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {streams.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required disabled={isLocked}>
            <InputLabel>Target Exam</InputLabel>
            <Select
              value={formData.targetExam}
              label="Target Exam"
              onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
            >
              {targetExams.map((exam) => (
                <MenuItem key={exam._id} value={exam._id}>
                  {exam.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid || submitting}>
          {submitting ? 'Saving...' : test ? 'Update Test' : 'Create Test'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestModal;