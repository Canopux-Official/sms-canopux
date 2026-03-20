import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0b2021', // Deep Dark Blue (almost black)
      light: '#203A43', // Gradient Step
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FFD700', // Gold (Success/Premium)
      light: '#FFE57F',
      dark: '#C79100',
      contrastText: '#0F2027',
    },
    text: {
      primary: '#0F2027',
      secondary: '#546e7a',
    },
    background: {
      default: '#fdfbf7', // Very slight cream for warmth, not harsh white
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Open Sans", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Montserrat", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Montserrat", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Montserrat", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Montserrat", sans-serif', fontWeight: 600 },
    button: { fontFamily: '"Montserrat", sans-serif', fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 12,
  },
});

export default responsiveFontSizes(theme);