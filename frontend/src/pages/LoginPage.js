import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Box, Container, Paper, TextField, Button, Typography, Alert, 
  InputAdornment, IconButton, Avatar, Link 
} from '@mui/material';
import { School, Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';

const LoginPage = () => {
 
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container maxWidth="sm">
        <Paper elevation={24} sx={{ p: 5, borderRadius: 4, backdropFilter: 'blur(10px)', bgcolor: 'rgba(255,255,255,0.95)' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
              <School fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight={700} gutterBottom>Welcome Back</Typography>
            <Typography variant="body2" color="text.secondary">Sign in to continue to EduManage</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} required margin="normal" InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> }} />
            <TextField fullWidth label="Password" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} required margin="normal" InputProps={{ startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end"><VisibilityOff /></IconButton></InputAdornment> }} />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1rem' }}>{loading ? 'Signing in...' : 'Sign In'}</Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Demo credentials: admin@school.com / Admin@123
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
