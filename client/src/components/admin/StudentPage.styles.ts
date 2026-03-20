import { styled } from '@mui/material/styles';
import { Box, Paper, TextField, Select } from '@mui/material';

export const PageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  width: '100%',
}));

export const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

export const FilterToolbar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  flexWrap: 'wrap',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
}));

export const SearchInput = styled(TextField)(({ theme }) => ({
  flex: '1 1 250px',
  minWidth: '250px',
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}));

export const FilterSelect = styled(Select)(({ theme }) => ({
  minWidth: '180px', // Slightly wider for multi-select tags
  backgroundColor: theme.palette.background.default,
  '& .MuiSelect-select': {
    paddingTop: '8.5px',
    paddingBottom: '8.5px',
  },
}));

export const ActionButtonContainer = styled(Box)({
  display: 'flex',
  gap: '8px',
  justifyContent: 'flex-end',
});