import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: '#00AB55', lighter: '#C8FACD', darker: '#005B30' },
      secondary: { main: '#3366FF', lighter: '#D6E4FF', darker: '#091A7A' },
      background: { default: mode === 'light' ? '#F9FAFB' : '#121212', paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E' },
      text: { primary: mode === 'light' ? '#212B36' : '#FFFFFF', secondary: mode === 'light' ? '#637381' : '#B0B0B0' }
    },
    shape: { borderRadius: 12 },
    typography: { fontFamily: 'Inter, Roboto, sans-serif' },
    components: {
      MuiCard: { styleOverrides: { root: { boxShadow: '0px 0px 2px rgba(0,0,0,0.02), 0px 1px 4px rgba(0,0,0,0.02)', borderRadius: 16 } } },
      MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: 10 } } }
    }
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
