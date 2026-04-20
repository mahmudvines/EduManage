import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Box, Typography, Paper, TextField, Button, Avatar, Alert,
  Grid, CircularProgress, Stack
} from '@mui/material';
import { Save, Upload } from '@mui/icons-material';

const AdminProfilePage = () => {
  const { user, updateUser, updateAvatar } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', password: '', confirmPassword: '' });
      setAvatarPreview(user.avatar ? `${apiUrl}${user.avatar}` : '');
    }
  }, [user, apiUrl]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const updateData = { name: form.name, email: form.email };
      if (form.password) updateData.password = form.password;
      const res = await axios.put(`${apiUrl}/api/profile`, updateData, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        updateUser(res.data.data);
        setSuccess('Profile updated successfully');
      } else {
        setError(res.data.message);
      }
    } catch (err) { setError(err.response?.data?.message || 'Update failed'); }
    setLoading(false);
  };

  const handleAvatarUpload = async () => {
    if (!avatar) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('avatar', avatar);
    try {
      const res = await axios.post(`${apiUrl}/api/profile/avatar`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        const newAvatarUrl = res.data.avatarUrl;
        setAvatarPreview(`${apiUrl}${newAvatarUrl}`);
        updateAvatar(newAvatarUrl);
        setSuccess('Avatar updated');
      } else {
        setError(res.data.message);
      }
    } catch (err) { setError('Avatar upload failed'); }
    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Admin Profile</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Manage your personal information and profile picture</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
            <Avatar src={avatarPreview} sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
              {!avatarPreview && (user?.name?.charAt(0) || 'A')}
            </Avatar>
            <Button variant="outlined" component="label" startIcon={<Upload />} sx={{ mb: 1 }}>
              Choose Image
              <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
            </Button>
            <Button variant="contained" onClick={handleAvatarUpload} disabled={!avatar || loading} fullWidth>
              {loading ? <CircularProgress size={24} /> : 'Upload Avatar'}
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Max 5MB, JPG/PNG</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField fullWidth label="Full Name" name="name" value={form.name} onChange={handleChange} required />
                <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
                <TextField fullWidth label="New Password" name="password" type="password" value={form.password} onChange={handleChange} />
                <TextField fullWidth label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} />
                <Button type="submit" variant="contained" startIcon={<Save />} disabled={loading}>
                  Save Changes
                </Button>
              </Stack>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminProfilePage;
