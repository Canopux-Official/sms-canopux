import { styled } from '@mui/material/styles';
import { Paper, Box, Button } from '@mui/material';

// 1. Welcome Card (Cleaned up)
export const WelcomeCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #004d40 100%)`, // Dark Teal Gradient
  color: theme.palette.common.white,
  padding: theme.spacing(3),
  borderRadius: Number(theme.shape.borderRadius) * 2,
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  // Decorative circle
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -60,
    right: -20,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)', 
  }
}));

// 2. General Info Card (Used for Materials, Notices)
export const InfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  height: '100%',
  backgroundColor: '#fff',
  display: 'flex',
  flexDirection: 'column',
}));

// 3. Exam Countdown Card
export const CountdownCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)`, // Green Gradient
  color: 'white',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
}));

// 4. Quick Action Button (Icon + Text)
export const QuickActionButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  backgroundColor: '#f8f9fa',
  textTransform: 'none',
  height: '100%',
  width: '100%',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: '#e8f5e9', // Light green hover
    borderColor: '#66bb6a',
    transform: 'translateY(-2px)',
  },
}));

// 5. Quote Section
export const QuoteBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#fff3e0', // Light Orange/Gold tint
  borderRadius: theme.shape.borderRadius,
  borderLeft: `4px solid #ffb74d`,
  fontStyle: 'italic',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(3),
}));

export const NoticePreview = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#f8fcf8', 
  borderRadius: theme.shape.borderRadius,
  borderLeft: `4px solid #66bb6a`, 
  marginBottom: theme.spacing(2),
}));






// DON' T DELETE THIS PART COMMENTED BELOW


// import { styled } from '@mui/material/styles';
// import { Paper, Box, Button, Card } from '@mui/material';

// // 1. Welcome Card - FIXED CONTRAST & GRADIENT
// export const WelcomeCard = styled(Paper)(({ theme }) => ({
//   background: 'linear-gradient(135deg, #004d40 0%, #00695c 100%)', // Dark Teal Gradient
//   color: theme.palette.common.white,
//   padding: theme.spacing(3),
//   borderRadius: 24,
//   position: 'relative',
//   overflow: 'hidden',
//   display: 'flex',
//   flexDirection: 'column',
//   justifyContent: 'center',
//   boxShadow: '0 10px 40px -10px rgba(0, 77, 64, 0.5)',
//   minHeight: '220px', 
//   height: '100%',
// }));

// // 2. Section Container - Cleaner, lighter look
// export const SectionContainer = styled(Paper)(() => ({
//   backgroundColor: '#ffffff',
//   borderRadius: 20,
//   overflow: 'hidden',
//   boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
//   border: '1px solid rgba(0,0,0,0.05)',
//   height: '100%',
//   display: 'flex',
//   flexDirection: 'column',
// }));

// // 3. Section Header - Distinct separation
// export const SectionHeader = styled(Box)<{ bgcolor?: string }>(({ theme, bgcolor }) => ({
//   padding: theme.spacing(2, 3),
//   background: bgcolor || '#fff',
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'space-between',
//   borderBottom: '1px solid rgba(0,0,0,0.05)',
// }));

// // 4. Countdown Card - Orange Gradient
// export const CountdownCard = styled(Card)(({ theme }) => ({
//   background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
//   color: 'white',
//   padding: theme.spacing(2),
//   borderRadius: 24,
//   textAlign: 'center',
//   height: '100%',
//   minHeight: '220px',
//   display: 'flex',
//   flexDirection: 'column',
//   justifyContent: 'center',
//   alignItems: 'center',
//   boxShadow: '0 10px 30px -10px rgba(245, 124, 0, 0.4)',
//   position: 'relative',
//   overflow: 'hidden',
// }));

// // 5. Quick Action Button - Modern Interactive
// export const QuickActionButton = styled(Button)<{ accentColor: string }>(({ theme, accentColor }) => ({
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
//   justifyContent: 'center',
//   gap: theme.spacing(1),
//   padding: theme.spacing(2),
//   borderRadius: 16,
//   backgroundColor: '#fff',
//   color: theme.palette.text.primary,
//   textTransform: 'none',
//   height: '100%',
//   width: '100%',
//   minHeight: '110px',
//   boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
//   border: '1px solid transparent',
//   transition: 'all 0.2s ease',
//   position: 'relative',
//   overflow: 'hidden',
  
//   // Top accent border
//   '&::after': {
//     content: '""',
//     position: 'absolute',
//     top: 0, left: 0, right: 0, height: '4px',
//     background: accentColor,
//   },

//   '&:hover': {
//     transform: 'translateY(-4px)',
//     boxShadow: `0 8px 24px -5px ${accentColor}40`,
//   },
  
//   '& .MuiSvgIcon-root': {
//     fontSize: '2rem',
//     color: accentColor,
//   }
// }));

// // 6. Notice Preview
// export const NoticePreview = styled(Box)(({ theme }) => ({
//   padding: theme.spacing(2),
//   backgroundColor: '#f8f9fa',
//   borderRadius: 12,
//   borderLeft: `4px solid ${theme.palette.primary.main}`,
//   marginBottom: theme.spacing(2),
//   transition: 'all 0.2s',
//   cursor: 'pointer',
//   '&:hover': {
//     backgroundColor: '#fff',
//     boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
//   }
// }));