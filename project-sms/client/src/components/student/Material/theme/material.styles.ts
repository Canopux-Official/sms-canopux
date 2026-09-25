import { Card, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';


// Styled Components
export const StyledCard = styled(Card)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    borderColor: '#1976d2',
  },
}));

export const ClickableCard = styled(StyledCard)({
  cursor: 'pointer',
});

export const IconWrapper = styled(Box)<{ itemType: string }>(({ itemType }) => ({
  width: 56,
  height: 56,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'linear-gradient(135deg, #e5f5ee 0%, #bee7d5 100%)',
  color: itemType === 'folder' ? '#075c4f' : '#0f7b47',
  flexShrink: 0,
}));

export const FileChip = styled(Chip)({
  backgroundColor: '#e8f5e9',
  color: '#2e7d32',
  fontWeight: 500,
  fontSize: '0.75rem',
  height: '24px',
  marginRight: '8px',
  marginTop: '4px',
});

export const LinkChip = styled(Chip)({
  backgroundColor: '#e3f2fd',
  color: '#1565c0',
  fontWeight: 500,
  fontSize: '0.75rem',
  height: '24px',
  marginRight: '8px',
  marginTop: '4px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#bbdefb',
  },
});