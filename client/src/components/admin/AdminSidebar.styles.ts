import { styled } from '@mui/material/styles';

// Common Styles for the Drawer Paper (Background, Text Color)
export const drawerPaperStyles = {
  backgroundColor: '#0b2021', // Deep Dark Blue
  color: '#ffffff',
  borderRight: 'none',
};

export const LogoContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 3),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar, 
  justifyContent: 'flex-start',
  fontWeight: 800,
  fontSize: '1.5rem',
  color: '#FFD700', // Gold
  letterSpacing: '1px',
}));