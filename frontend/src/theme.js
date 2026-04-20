import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#00AB55', lighter: '#C8FACD', darker: '#005B30' },
    secondary: { main: '#3366FF', lighter: '#D6E4FF', darker: '#091A7A' },
    info: { main: '#1890FF', lighter: '#D0F2FF', darker: '#04297A' },
    success: { main: '#00AB55', lighter: '#C8FACD', darker: '#005B30' },
    warning: { main: '#FFC107', lighter: '#FFF7CD', darker: '#7A4F01' },
    error: { main: '#FF4842', lighter: '#FFE7D9', darker: '#7A0C2E' },
    background: { default: '#F9FAFB', paper: '#FFFFFF' },
    text: { primary: '#212B36', secondary: '#637381', disabled: '#919EAB' }
  },
  shape: { borderRadius: 8 },
  typography: { fontFamily: 'Inter, Roboto, sans-serif' },
  components: {
    MuiCard: { styleOverrides: { root: { boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.02), 0px 1px 4px rgba(0, 0, 0, 0.02), 0px 4px 8px rgba(0, 0, 0, 0.02)', borderRadius: 16 } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiTableRow: { styleOverrides: { root: { '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } } } }
  }
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00AB55', lighter: '#C8FACD', darker: '#005B30' },
    secondary: { main: '#3366FF', lighter: '#D6E4FF', darker: '#091A7A' },
    info: { main: '#1890FF', lighter: '#D0F2FF', darker: '#04297A' },
    success: { main: '#00AB55', lighter: '#C8FACD', darker: '#005B30' },
    warning: { main: '#FFC107', lighter: '#FFF7CD', darker: '#7A4F01' },
    error: { main: '#FF4842', lighter: '#FFE7D9', darker: '#7A0C2E' },
    background: { default: '#1E1E2F', paper: '#2A2A3D' },
    text: { primary: '#FFFFFF', secondary: '#A0A0B0', disabled: '#6C6C7A' }
  },
  shape: { borderRadius: 8 },
  typography: { fontFamily: 'Inter, Roboto, sans-serif' },
  components: {
    MuiCard: { styleOverrides: { root: { boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 1px 4px rgba(0, 0, 0, 0.2), 0px 4px 8px rgba(0, 0, 0, 0.2)', borderRadius: 16, backgroundColor: '#2A2A3D' } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiTableRow: { styleOverrides: { root: { '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } } } }
  }
});
