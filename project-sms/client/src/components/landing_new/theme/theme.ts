import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#063f26',
      contrastText: '#f8f4ef',
    },
    secondary: {
      main: '#f8f4ef',
      contrastText: '#063f26',
    },
    background: {
      default: '#fafaf8',
      paper: '#ffffff',
    },
    text: {
      primary: '#0d1f17',
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    h1: { fontFamily: '"Montserrat", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Montserrat", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Montserrat", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Montserrat", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Montserrat", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Montserrat", sans-serif', fontWeight: 600 },
    button: { fontFamily: '"Montserrat", sans-serif', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 600,
          letterSpacing: '-0.01em',
        },
      },
    },
  },
})

export default theme
