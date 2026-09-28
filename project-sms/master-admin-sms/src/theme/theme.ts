import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0b2021', // Same deep dark blue/black used by project-sms/client
      light: '#203A43',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2f6fed',
      light: '#6b9bff',
      dark: '#1c4fc2',
      contrastText: '#ffffff',
    },
    error: {
      main: '#d32f2f',
    },
    success: {
      main: '#2e7d32',
    },
    text: {
      primary: '#0F2027',
      secondary: '#546e7a',
    },
    background: {
      default: '#f5f6f8',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Open Sans", "Helvetica", "Arial", sans-serif',
    h4: { fontFamily: '"Montserrat", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Montserrat", sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Montserrat", sans-serif', fontWeight: 700 },
    button: { fontFamily: '"Montserrat", sans-serif', fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

export default responsiveFontSizes(theme);