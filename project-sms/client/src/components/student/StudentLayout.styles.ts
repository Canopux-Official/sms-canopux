import { styled } from '@mui/material/styles';
import { Box, Drawer, AppBar } from '@mui/material';

const DRAWER_WIDTH = 260;

export const RootContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.primary.main, // Deep Dark Blue
    color: theme.palette.primary.contrastText,
    borderRight: 'none',
  },
}));

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  width: `calc(100% - ${DRAWER_WIDTH}px)`,
  marginLeft: DRAWER_WIDTH,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.05)',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    marginLeft: 0,
  },
}));

export const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: 64, // Height of Toolbar
  width: '100%',
  overflowX: 'hidden',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

export const LogoSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
}));