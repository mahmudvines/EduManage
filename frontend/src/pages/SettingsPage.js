import React, { useState } from 'react';
import {
  Box, Typography, Paper, Switch, FormControlLabel, Divider,
  Slider, Select, MenuItem, FormControl, InputLabel, Button,
  Alert, Avatar, Stack, TextField
} from '@mui/material';
import { useThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Save, Notifications, Language, Security, Palette } from '@mui/icons-material';

const SettingsPage = () => {
  const { mode, toggleTheme } = useThemeMode();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [language, setLanguage] = useState('en');
  const [fontSize, setFontSize] = useState(16);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('notifications', notifications);
    localStorage.setItem('emailAlerts', emailAlerts);
    localStorage.setItem('language', language);
    localStorage.setItem('fontSize', fontSize);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Settings</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Manage your preferences and account settings</Typography>

      {saved && <Alert severity="success" sx={{ mb: 3 }}>Settings saved successfully!</Alert>}

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>Appearance</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
          <FormControlLabel control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />} label="Dark Mode" />
          <Box>
            <Typography gutterBottom>Font Size</Typography>
            <Slider value={fontSize} onChange={(e, val) => setFontSize(val)} min={12} max={24} step={1} valueLabelDisplay="auto" />
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>Notifications</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1}>
          <FormControlLabel control={<Switch checked={notifications} onChange={() => setNotifications(!notifications)} />} label="Push Notifications" />
          <FormControlLabel control={<Switch checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />} label="Email Alerts" />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>Preferences</Typography>
        <Divider sx={{ mb: 2 }} />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Language</InputLabel>
          <Select value={language} label="Language" onChange={(e) => setLanguage(e.target.value)}>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
            <MenuItem value="fr">French</MenuItem>
            <MenuItem value="de">German</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <Button variant="contained" startIcon={<Save />} onClick={handleSave}>Save Settings</Button>
    </Box>
  );
};

export default SettingsPage;
