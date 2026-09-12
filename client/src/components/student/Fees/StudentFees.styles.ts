import { styled } from '@mui/material/styles';
import { Box, Paper } from '@mui/material';

export const FeeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  width: '100%',
}));

export const SummaryCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: (theme.shape.borderRadius as number) * 2,
  border: `1px solid ${theme.palette.divider}`,
  flex: 1,
  minWidth: 160,
}));