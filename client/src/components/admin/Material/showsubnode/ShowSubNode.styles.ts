import { styled } from '@mui/material/styles';
import { Box, Paper } from '@mui/material';

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

export const ClassInfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  borderRadius: '16px',
  border: '1px solid #e0e0e0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
}));

export const StatsBox = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(1.5),
  },
}));

export const StatItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  borderRadius: '12px',
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
}));

export const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2),
  },
}));

export const SubnodeGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
  gap: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: theme.spacing(2.5),
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
  },
}));