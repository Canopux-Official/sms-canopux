// components/YearSelector.tsx

import React from 'react';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  Box,
  Typography,
  type SelectChangeEvent
} from '@mui/material';

interface YearSelectorProps {
  availableYears: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const YearSelector: React.FC<YearSelectorProps> = ({ 
  availableYears, 
  selectedYear, 
  onYearChange 
}) => {
  const handleChange = (event: SelectChangeEvent<number>) => {
    onYearChange(event.target.value as number);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          mb: 1, 
          color: '#333',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}
      >
        Select Year
      </Typography>
      
      <FormControl 
        fullWidth 
        size="small"
        sx={{
          maxWidth: { xs: '100%', sm: 200 }
        }}
      >
        <Select
          value={selectedYear}
          onChange={handleChange}
          sx={{
            backgroundColor: '#fff',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e0e0',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2',
            },
          }}
        >
          {availableYears.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default YearSelector;