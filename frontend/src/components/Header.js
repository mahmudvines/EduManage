import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import {
  AppBar, Toolbar, IconButton, Badge, InputBase, Avatar, Menu, MenuItem,
  Box, alpha, styled, Switch, FormControlLabel
} from '@mui/material';
import {
  Menu as MenuIcon, Search as SearchIcon, Notifications as NotificationsIcon,
  Person as PersonIcon, Settings as SettingsIcon, Logout as LogoutIcon,
  Brightness4, Brightness7
} from '@mui/icons-material';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 20,
  backgroundColor: alpha(theme.palette.common.black, 0.04),
  '&:hover': { backgroundColor: alpha(theme.palette.common.black, 0.08) },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: { width: 'auto' },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': { padding: theme.spacing(1, 1, 1, 0), paddingLeft: `calc(1em + ${theme.spacing(4)})`, transition: theme.transitions.create('width'), width: '100%', [theme.breakpoints.up('md')]: { width: '20ch' } },
}));

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNotifOpen = (event) => setNotifAnchorEl(event.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'background.paper', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ display: { lg: 'none' } }}>
          <MenuIcon />
        </IconButton>

        <Search>
          <SearchIconWrapper><SearchIcon /></SearchIconWrapper>
          <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} />
        </Search>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
          <IconButton onClick={handleNotifOpen} color="inherit">
            <Badge badgeContent={3} color="error"><NotificationsIcon /></Badge>
          </IconButton>
          <IconButton onClick={handleMenuOpen} color="inherit" sx={{ p: 0.5 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
          </IconButton>
        </Box>

        <Menu anchorEl={notifAnchorEl} open={Boolean(notifAnchorEl)} onClose={handleNotifClose}>
          <MenuItem onClick={handleNotifClose}>New student registered</MenuItem>
          <MenuItem onClick={handleNotifClose}>Class schedule updated</MenuItem>
        </Menu>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}><PersonIcon fontSize="small" sx={{ mr: 1 }} /> Profile</MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}><SettingsIcon fontSize="small" sx={{ mr: 1 }} /> Settings</MenuItem>
          <MenuItem onClick={handleLogout}><LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
