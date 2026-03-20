// components/ShowClass/ShowClass.styles.ts
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const MainContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(4),
  backgroundColor: '#fafbfc',
  minHeight: '100vh',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

export const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(3),
  },
}));

export const ClassGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: theme.spacing(2.5),
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
  },
}));