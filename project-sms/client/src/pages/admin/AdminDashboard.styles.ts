// import { styled } from '@mui/material/styles';
// import { Box } from '@mui/material';

// export const LayoutRoot = styled(Box)(({ theme }) => ({
//   display: 'flex',
//   height: '100vh',
//   width: '100vw',
//   overflow: 'hidden',
//   backgroundColor: theme.palette.grey[100], 
// }));

// export const MainContent = styled(Box)(() => ({
//   flexGrow: 1,
//   display: 'flex',
//   flexDirection: 'column',
//   height: '100%',
//   width: '100%', 
//   position: 'relative',
//   overflow: 'hidden',
// }));

// // FIX: Changed from styled(Box) to styled('main')
// // This ensures it is always a <main> tag and removes the need for the 'component' prop
// export const ContentWrapper = styled('main')(({ theme }) => ({
//   flex: 1,
//   padding: theme.spacing(3),
//   [theme.breakpoints.down('sm')]: {
//     padding: theme.spacing(2),
//   },
//   overflowY: 'auto',
//   '&::-webkit-scrollbar': {
//     width: '6px',
//     height: '6px',
//   },
//   '&::-webkit-scrollbar-thumb': {
//     backgroundColor: '#cbd5e1',
//     borderRadius: '3px',
//   },
// }));

// AdminDashboard.styles.ts
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const LayoutRoot = styled(Box)(() => ({
  display: 'flex',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
}));

export const MainContent = styled(Box)(() => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  // minWidth: 0 is the critical fix — without it, flex children
  // don't shrink below their content size and overflow the container
  minWidth: 0,
  overflow: 'hidden',
  position: 'relative',
}));

export const ContentWrapper = styled('main')(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
  overflowY: 'auto',
  overflowX: 'hidden',
  '&::-webkit-scrollbar': {
    width: '6px',
    height: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#cbd5e1',
    borderRadius: '3px',
  },
}));