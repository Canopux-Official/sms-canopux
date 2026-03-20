import { styled } from '@mui/material/styles';
import { Paper, Box, Button } from '@mui/material';

export const ProfileHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(4),
  paddingBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    textAlign: 'center',
  },
}));

export const SectionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
  backgroundColor: '#fff',
}));

export const LabelText = styled('span')(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontWeight: 600,
  display: 'block',
  marginBottom: '6px',
}));

export const ValueText = styled('div')(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '1rem',
  fontWeight: 500,
  backgroundColor: '#f8f9fa',
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #e9ecef',
  display: 'inline-block',
  minWidth: '100%',
}));

export const Badge = styled('span')<{ colorType?: string }>(({colorType }) => ({
  padding: '4px 12px',
  borderRadius: '16px',
  fontSize: '0.75rem',
  fontWeight: 700,
  backgroundColor: colorType === 'active' ? '#e8f5e9' : '#e3f2fd',
  color: colorType === 'active' ? '#2e7d32' : '#1565c0',
  border: `1px solid ${colorType === 'active' ? '#c8e6c9' : '#bbdefb'}`,
}));

// Added ActionButton here to fix the error
export const ActionButton = styled(Button)(() => ({
  background: 'linear-gradient(45deg, #FFD700 30%, #66bb6a 90%)', // Gold to Green
  border: 0,
  borderRadius: 8,
  boxShadow: '0 3px 5px 2px rgba(102, 187, 106, .3)',
  color: '#0b2021', // Dark Text
  height: 40,
  padding: '0 20px',
  fontWeight: 700,
  textTransform: 'none',
  transition: 'transform 0.2s',
  '&:hover': {
    background: 'linear-gradient(45deg, #FFC107 30%, #43a047 90%)',
    transform: 'scale(1.02)',
  },
}));