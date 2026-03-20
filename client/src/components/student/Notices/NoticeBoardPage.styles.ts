import { styled } from '@mui/material/styles';
import { Paper, Box } from '@mui/material';

export const NoticeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
  transition: 'all 0.2s',
  '&:hover': {
    boxShadow: theme.shadows[2],
    borderColor: theme.palette.primary.light,
  },
}));

export const DateBadge = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: '4px 12px',
  borderRadius: '16px',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  border: `1px solid ${theme.palette.divider}`,
}));