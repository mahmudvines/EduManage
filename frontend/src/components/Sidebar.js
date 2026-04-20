import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  IconButton, Typography, Divider, Collapse, Avatar, Stack, Tooltip,
  Switch
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People as PeopleIcon, School as SchoolIcon,
  MenuBook as MenuBookIcon, Settings as SettingsIcon, Logout as LogoutIcon,
  ExpandLess, ExpandMore, ChevronLeft as ChevronLeftIcon,
  DarkMode, LightMode, Person as PersonIcon
} from '@mui/icons-material';

const drawerWidth = 280;

const Sidebar = ({ open, onClose, onDrawerClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const [openSettings, setOpenSettings] = useState(false);

  const isAdmin = user?.role === 'admin';

  const mainNavItems = isAdmin ? [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Students', icon: <PeopleIcon />, path: '/students' },
    { text: 'Teachers', icon: <SchoolIcon />, path: '/teachers' },
    { text: 'Classes', icon: <MenuBookIcon />, path: '/classes' },
  ] : [];

  const settingsNavItems = [
    { text: 'Preferences', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onDrawerClose) onDrawerClose();
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={700}>EduManage</Typography>
        {onDrawerClose && (<IconButton onClick={onDrawerClose}><ChevronLeftIcon /></IconButton>)}
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={user?.avatar ? `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${user.avatar}` : ''} sx={{ bgcolor: 'primary.main' }}>
            {!user?.avatar && (user?.name?.charAt(0) || 'A')}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>{user?.name || 'Admin'}</Typography>
            <Typography variant="caption" color="text.secondary" textTransform="capitalize">{user?.role || 'admin'}</Typography>
          </Box>
        </Stack>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, py: 2 }}>
        <List>
          {mainNavItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleNavigation(item.path)} selected={location.pathname === item.path} sx={{ borderRadius: 2, mb: 0.5 }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}

          <ListItemButton onClick={() => setOpenSettings(!openSettings)} sx={{ borderRadius: 2, mt: 1 }}>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Settings" />
            {openSettings ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openSettings} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {settingsNavItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ pl: 4 }}>
                  <ListItemButton onClick={() => handleNavigation(item.path)} sx={{ borderRadius: 2 }}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {mode === 'dark' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
            <Typography variant="body2">{mode === 'dark' ? 'Dark Mode' : 'Light Mode'}</Typography>
          </Box>
          <Switch checked={mode === 'dark'} onChange={toggleTheme} size="small" />
        </Stack>
        <ListItemButton onClick={() => { logout(); navigate('/login'); }} sx={{ borderRadius: 2, bgcolor: 'error.lighter' }}>
          <ListItemIcon><LogoutIcon sx={{ color: 'error.main' }} /></ListItemIcon>
          <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer variant="temporary" open={open} onClose={onClose} sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}>{drawerContent}</Drawer>
      <Drawer variant="permanent" sx={{ display: { xs: 'none', lg: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}>{drawerContent}</Drawer>
    </>
  );
};

export default Sidebar;
