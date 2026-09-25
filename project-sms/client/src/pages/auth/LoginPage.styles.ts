import type { SxProps, Theme } from '@mui/material';

export const loginStyles: Record<string, SxProps<Theme>> = {
  container: {
    height: '100vh',
    display: 'flex',
    overflow: 'hidden',
  },
  // Left Side (Branded Visual)
  leftSection: {
    flex: 1.2, // Slightly wider to show off the branding
    display: { xs: 'none', md: 'flex' },
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center', // Center text
    position: 'relative',
    bgcolor: '#081a1bff',
    color: 'white',
    p: 6,
    zIndex: 1,
    overflow: 'hidden',
    // A subtle pattern overlay instead of a random photo
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
    }
  },
  welcomeText: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 800,
    fontSize: '3.5rem',
    lineHeight: 1.1,
    mb: 2,
    textAlign: 'center',
    background: 'linear-gradient(45deg, #ffffff 30%, #FFD700 100%)', // White to Gold
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subText: {
    fontSize: '1.2rem',
    opacity: 0.8,
    textAlign: 'center',
    maxWidth: '80%',
  },

  // Right Side (Form)
  rightSection: {
    flex: { xs: 1, md: 0.8 },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    bgcolor: 'background.paper',
    p: 4,
    position: 'relative',
  },
  formBox: {
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  // The Logo on the Form Side
  // Find 'brandLogo' in your existing styles and update it:
  brandLogo: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 800,
    fontSize: { xs: '1.8rem', md: '2rem' }, // Responsive font size
    mb: 1,
    color: '#0b2021',
    letterSpacing: '-1px',
    cursor: 'pointer',
  },
  inputField: {
    mb: 3,
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      bgcolor: '#f8f9fa', // Light grey bg for inputs
    },
  },
  actionBtn: {
    py: 1.5,
    borderRadius: 3,
    fontSize: '1rem',
    fontWeight: 700,
    textTransform: 'none',
    mb: 3,
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
  },
  adminActionBtn: {
    py: 1.5,
    borderRadius: 3,
    fontSize: '1rem',
    fontWeight: 700,
    textTransform: 'none',
    mb: 3,
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    backgroundColor: '#0b2021', // Dark teal matching the left section
    color: 'white',
    '&:hover': {
      backgroundColor: '#113335',
    }
  },
  superAdminActionBtn: {
    py: 1.5,
    borderRadius: 3,
    fontSize: '1rem',
    fontWeight: 700,
    textTransform: 'none',
    mb: 3,
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
    backgroundColor: '#8b0000', // Deep red for super admin
    color: 'white',
    '&:hover': {
      backgroundColor: '#a50000',
    }
  },
  backLink: {
    cursor: 'pointer',
    color: 'text.secondary',
    textDecoration: 'none',
    mt: 2,
    fontSize: '0.9rem',
    fontWeight: 600,
    transition: 'color 0.2s',
    '&:hover': {
      color: 'primary.main',
    },
  }
};