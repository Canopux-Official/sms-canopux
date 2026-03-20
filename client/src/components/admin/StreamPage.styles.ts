import { styled } from '@mui/material/styles';
import { Box, Paper } from '@mui/material';

export const StreamContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  width: '100%',
  paddingBottom: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    paddingBottom: theme.spacing(4),
  },
}));

export const StreamHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column', 
  gap: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

export const StreamGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr', 
  gap: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: theme.spacing(3),
  },
}));

export const StreamCard = styled(Paper)(({ theme }) => ({
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius as number * 2,
  overflow: 'hidden',
  backgroundColor: '#fff',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.15)',
    borderColor: theme.palette.primary.main,
  },
}));