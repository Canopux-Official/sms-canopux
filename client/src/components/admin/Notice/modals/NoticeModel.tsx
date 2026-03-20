import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  MenuItem,
  Box,
  FormControl,
  InputLabel,
  Select,
  type SelectChangeEvent,
  Chip,
  OutlinedInput,
} from '@mui/material';
import type { ClassType, Notice, NoticeFormData, Stream, TargetExam } from '../types/types';

interface NoticeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NoticeFormData) => void;
  notice?: Notice | null;
  streams: Stream[];
  targetExams: TargetExam[];
}

const CLASS_TYPES: ClassType[] = ['9', '10', '11', '12'];

const NoticeModal: React.FC<NoticeModalProps> = ({
  open,
  onClose,
  onSubmit,
  notice,
  streams,
  targetExams,
}) => {
  const [formData, setFormData] = useState<NoticeFormData>({
    heading: '',
    description: '',
    imageLink: '',
    tag: '',
    classType: '',
    streams: [],
    targetExams: [],
    isForAll: false,
  });

  useEffect(() => {
    if (notice) {
      setFormData({
        heading: notice.heading || '',
        description: notice.description || '',
        imageLink: notice.imageLink || '',
        tag: notice.tag || '',
        classType: notice.classType || '',
        streams: notice.streams?.map(s => s._id) || [],
        targetExams: notice.targetExams?.map(e => e._id) || [],
        isForAll: notice.isForAll || false,
      });
    } else {
      setFormData({
        heading: '',
        description: '',
        imageLink: '',
        tag: '',
        classType: '',
        streams: [],
        targetExams: [],
        isForAll: false,
      });
    }
  }, [notice, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultiSelectChange = (
    e: SelectChangeEvent<string[]>,
    fieldName: 'streams' | 'targetExams'
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isForAll = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      isForAll,
      classType: isForAll ? '' : prev.classType,
      streams: isForAll ? [] : prev.streams,
      targetExams: isForAll ? [] : prev.targetExams,
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{notice ? 'Edit Notice' : 'Create Notice'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Heading"
            name="heading"
            value={formData.heading}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />

          {/* <TextField
            label="Image Link"
            name="imageLink"
            value={formData.imageLink}
            onChange={handleChange}
            fullWidth
            placeholder="https://example.com/image.jpg"
          /> */}

          <TextField
            label="Tag"
            name="tag"
            value={formData.tag}
            onChange={handleChange}
            fullWidth
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isForAll}
                onChange={handleSwitchChange}
                name="isForAll"
              />
            }
            label="Send to All Students"
          />

          {!formData.isForAll && (
            <>
              <FormControl fullWidth>
                <InputLabel>Class Type</InputLabel>
                <Select
                  name="classType"
                  value={formData.classType}
                  onChange={handleChange}
                  label="Class Type"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {CLASS_TYPES.map((classType) => (
                    <MenuItem key={classType} value={classType}>
                      Class {classType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {formData.classType == '9' || formData.classType == '10' ? null : (

              <FormControl fullWidth>
                <InputLabel>Streams</InputLabel>
                <Select
                  multiple
                  name="streams"
                  value={formData.streams}
                  onChange={(e) => handleMultiSelectChange(e, 'streams')}
                  input={<OutlinedInput label="Streams" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const stream = streams.find(s => s._id === value);
                        return (
                          <Chip key={value} label={stream?.name || value} size="small" />
                        );
                      })}
                    </Box>
                  )}
                >
                  {streams.map((stream) => (
                    <MenuItem key={stream._id} value={stream._id}>
                      {stream.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              )}

              <FormControl fullWidth>
                <InputLabel>Target Exams</InputLabel>
                <Select
                  multiple
                  name="targetExams"
                  value={formData.targetExams}
                  onChange={(e) => handleMultiSelectChange(e, 'targetExams')}
                  input={<OutlinedInput label="Target Exams" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const exam = targetExams.find(e => e._id === value);
                        return (
                          <Chip key={value} label={exam?.name || value} size="small" />
                        );
                      })}
                    </Box>
                  )}
                >
                  {targetExams.map((exam) => (
                    <MenuItem key={exam._id} value={exam._id}>
                      {exam.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {notice ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoticeModal;