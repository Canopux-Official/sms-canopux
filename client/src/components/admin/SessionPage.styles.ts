import { styled } from '@mui/material/styles';
import { Box, Paper, TableCell, TextField, Select } from '@mui/material';

export const SessionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  width: '100%',
}));

export const ControlPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: '#f8fafc',
}));

// --- NEW FILTER STYLES (Matching StudentsPage) ---
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
  flex: '1 1 auto',
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    minWidth: '250px',
    width: 'auto',
  },
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}));

export const FilterSelect = styled(Select)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    minWidth: '180px',
    width: 'auto',
  },
  backgroundColor: theme.palette.background.default,
  '& .MuiSelect-select': {
    paddingTop: '8.5px',
    paddingBottom: '8.5px',
  },
}));
// -------------------------------------------------

export const PromotionTableContainer = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

export const StatusCell = styled(TableCell)(() => ({
  fontWeight: 600,
  textTransform: 'uppercase',
  fontSize: '0.75rem',
}));

export const DiffView = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  '& .new': {
    color: theme.palette.success.main,
    fontWeight: 700,
  },
}));