import { createTheme } from '@mui/material/styles';

// Configuración global de tipografía
const THEME = {
  typography: {
    fontFamily: `"Montserrat", sans-serif`,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
  }
};

// Extiende el tema claro usando THEME
const lightTheme = createTheme({
  ...THEME,
  palette: {
    mode: 'light',
    primary: {
      main: '#F4F3F2', // Color de fondo de los botones
    },
    text: {
      primary: '#323232', // Color del texto
    },
    background: {
      default: '#F4F3F2', // Color de fondo general
    },
  },
});

// Extiende el tema oscuro usando THEME
const darkTheme = createTheme({
  ...THEME,
  palette: {
    mode: 'dark',
    primary: {
      main: '#FAFBFD', // Color de fondo de los botones
    },
    text: {
      primary: '#FAFBFD', // Color del texto
    },
    background: {
      default: '#2c333a', // Color de fondo general
    },
  },
});

export { lightTheme, darkTheme };
