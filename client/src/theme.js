import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // Habilita el modo oscuro
    primary: {
      main: '#90caf9', // Azul claro
    },
    secondary: {
      main: '#f48fb1', // Rosa claro
    },
    background: {
      default: '#121212', // Fondo general
      paper: '#1e1e1e', // Fondo para tarjetas y componentes
    },
    text: {
      primary: '#ffffff', // Texto principal
      secondary: '#aaaaaa', // Texto secundario
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontWeight: 300,
      fontSize: '3rem',
    },
    h2: {
      fontWeight: 300,
      fontSize: '2rem',
    },
    body1: {
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none', // Evita que los textos de botones estén en mayúsculas
    },
  },
});

export default theme;
