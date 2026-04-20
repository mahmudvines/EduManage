import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Box, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Typography,
  Avatar, TablePagination, InputAdornment, Alert
} from '@mui/material';
import { Edit, Delete, Add, Search, School } from '@mui/icons-material';

const TeacherManagementPage = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', subject: '' });
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const token = localStorage.getItem('token');

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/auth/teachers`, { headers: { Authorization: `Bearer ${token}` } });
      setTeachers(res.data);
      setFiltered(res.data);
    } catch (err) { console.error(err); setError('Failed to fetch teachers'); }
  }, [apiUrl, token]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  useEffect(() => {
    setFiltered(teachers.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()) || t.email?.toLowerCase().includes(search.toLowerCase())));
    setPage(0);
  }, [search, teachers]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      let response;
      if (editingId) {
        response = await axios.put(`${apiUrl}/api/auth/teachers/${editingId}`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        if (!form.password) { setError('Password is required'); setLoading(false); return; }
        response = await axios.post(`${apiUrl}/api/auth/teachers`, form, { headers: { Authorization: `Bearer ${token}` } });
      }
      if (response.data.success) {
        setSuccess(editingId ? 'Teacher updated' : 'Teacher created');
        handleClose();
        fetchTeachers();
      } else {
        setError(response.data.message || 'Operation failed');
      }
    } catch (err) { setError(err.response?.data?.message || err.message); }
    setLoading(false);
  };

  const handleEdit = (teacher) => { setEditingId(teacher._id); setForm({ name: teacher.name, email: teacher.email, department: teacher.department || '', subject: teacher.subject || '', password: '' }); setOpenDialog(true); };
  const handleDelete = async (id) => { if (window.confirm('Delete this teacher?')) { try { await axios.delete(`${apiUrl}/api/auth/teachers/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchTeachers(); setSuccess('Teacher deleted'); } catch (err) { setError(err.response?.data?.message); } } };
  const handleClose = () => { setOpenDialog(false); setEditingId(null); setForm({ name: '', email: '', password: '', department: '', subject: '' }); setError(''); setSuccess(''); };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box><Typography variant="h4" fontWeight={700}>Teacher Management</Typography><Typography variant="body2" color="text.secondary">Manage all teachers, assign subjects, and view details</Typography></Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>Add Teacher</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      <Paper sx={{ p: 2, mb: 3 }}><TextField fullWidth placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} /></Paper>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'background.default' }}><TableRow><TableCell>Teacher</TableCell><TableCell>Email</TableCell><TableCell>Department</TableCell><TableCell>Subject</TableCell><TableCell align="center">Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((teacher, idx) => (
              <TableRow key={teacher._id} hover sx={{ bgcolor: idx % 2 === 0 ? 'action.hover' : 'inherit' }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#9c27b0', color: '#fff' }}>{teacher.name?.charAt(0) || '?'}</Avatar>
                    <Typography variant="subtitle2" fontWeight={600}>{teacher.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{teacher.email}</TableCell><TableCell>{teacher.department || 'General'}</TableCell><TableCell>{teacher.subject || '-'}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="primary" onClick={() => handleEdit(teacher)}><Edit /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(teacher._id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filtered.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, newPage) => setPage(newPage)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
      </TableContainer>
      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
        <DialogContent><Grid container spacing={2} sx={{ mt: 1 }}><Grid item xs={12}><TextField fullWidth label="Full Name" name="name" value={form.name} onChange={handleChange} required /></Grid><Grid item xs={12}><TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required /></Grid>{!editingId && <Grid item xs={12}><TextField fullWidth label="Password" name="password" type="password" value={form.password} onChange={handleChange} required /></Grid>}<Grid item xs={12}><TextField fullWidth label="Department" name="department" value={form.department} onChange={handleChange} /></Grid><Grid item xs={12}><TextField fullWidth label="Subject" name="subject" value={form.subject} onChange={handleChange} /></Grid></Grid></DialogContent>
        <DialogActions><Button onClick={handleClose}>Cancel</Button><Button variant="contained" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherManagementPage;

