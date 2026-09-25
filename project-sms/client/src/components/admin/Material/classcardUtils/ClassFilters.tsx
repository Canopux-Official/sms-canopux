// components/ClassFilters/ClassFilters.tsx
import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  type SelectChangeEvent,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface TargetExam {
  _id: string;
  name: string;
}

interface Stream {
  _id: string;
  name: string;
}

interface ClassFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterTag: string;
  onTagChange: (value: string) => void;
  filterClassType: string;
  onClassTypeChange: (value: string) => void;
  filterStream: string;
  onStreamChange: (value: string) => void;
  filterTargetExam: string;
  onTargetExamChange: (value: string) => void;
  targetExams: TargetExam[];
  streams: Stream[];
  classOptions: Array<{ value: string; label: string }>;
}

const ClassFilters: React.FC<ClassFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterClassType,
  onClassTypeChange,
  filterStream,
  onStreamChange,
  filterTargetExam,
  onTargetExamChange,
  targetExams,
  streams,
  classOptions,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 3,
        flexWrap: 'wrap',
      }}
    >
      {/* Search Bar */}
      <TextField
        placeholder="Search heading, description, tag..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        sx={{
          flex: { xs: '1 1 100%', sm: '1 1 300px' },
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#ffffff',
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#9e9e9e', fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Class Type Filter */}
      <FormControl
        size="small"
        sx={{
          minWidth: 150,
          flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' },
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#ffffff',
          },
        }}
      >
        <InputLabel>Class Type</InputLabel>
        <Select
          value={filterClassType}
          label="Class Type"
          onChange={(e: SelectChangeEvent) => onClassTypeChange(e.target.value)}
        >
          <MenuItem value="">All Types</MenuItem>
          {classOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Stream Filter */}
      <FormControl
        size="small"
        sx={{
          minWidth: 150,
          flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' },
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#ffffff',
          },
        }}
      >
        <InputLabel>Stream</InputLabel>
        <Select
          value={filterStream}
          label="Stream"
          onChange={(e: SelectChangeEvent) => onStreamChange(e.target.value)}
        >
          <MenuItem value="">All Streams</MenuItem>
          {streams.map((stream) => (
            <MenuItem key={stream._id} value={stream._id}>
              {stream.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Target Exam Filter */}
      <FormControl
        size="small"
        sx={{
          minWidth: 150,
          flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' },
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#ffffff',
          },
        }}
      >
        <InputLabel>Target Exam</InputLabel>
        <Select
          value={filterTargetExam}
          label="Target Exam"
          onChange={(e: SelectChangeEvent) => onTargetExamChange(e.target.value)}
        >
          <MenuItem value="">All Exams</MenuItem>
          {targetExams.map((exam) => (
            <MenuItem key={exam._id} value={exam._id}>
              {exam.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ClassFilters;