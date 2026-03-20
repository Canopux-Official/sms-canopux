import { styled } from '@mui/material/styles';
import { Paper, Box } from '@mui/material';

export const DashboardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  width: '100%',
}));

export const StatsFlexContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(3),
  width: '100%',
}));

export const StatCardWrapper = styled(Paper)(({ theme }) => ({
  flex: '1 1 240px', // Flex-grow, Flex-shrink, Flex-basis
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none', // Flat style per your theme preference
  transition: 'box-shadow 0.2s, transform 0.2s',
  '&:hover': {
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
    transform: 'translateY(-2px)',
  },
}));

export const CardHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px',
});

export const TrendBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isPositive',
})<{ isPositive: boolean }>(({ theme, isPositive }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 8px',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 700,
  backgroundColor: isPositive 
    ? theme.palette.success.light // Using theme palette if available, or fallback below
    : theme.palette.error.light,
  color: isPositive 
    ? theme.palette.success.contrastText 
    : theme.palette.error.contrastText,
  marginTop: 'auto', 
  width: 'fit-content',
}));