import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Box, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Typography, Chip, Avatar, TablePagination, InputAdornment, Alert
} from '@mui/material';
import { Edit, Delete, Add, Search } from '@mui/icons-material';

const StudentManagementPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', rollNumber: '', class: '', section: '', semester: '',
    parentName: '', parentPhone: '', address: '', dateOfBirth: '', gender: 'Male', status: 'Active'
  });
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const token = localStorage.getItem('token');

  const fetchStudents = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/students`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setStudents(res.data.data);
        setFiltered(res.data.data);
      }
    } catch (err) { console.error(err); setError('Failed to fetch students'); }
  }, [apiUrl, token]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    setFiltered(students.filter(s => 
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase())
    ));
    setPage(0);
  }, [search, students]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      let response;
      if (editingId) {
        response = await axios.put(`${apiUrl}/api/students/${editingId}`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        response = await axios.post(`${apiUrl}/api/students`, form, { headers: { Authorization: `Bearer ${token}` } });
      }
      if (response.data.success) {
        setSuccess(editingId ? 'Student updated' : 'Student created');
        handleClose();
        fetchStudents();
      } else {
        setError(response.data.message || 'Operation failed');
      }
    } catch (err) { setError(err.response?.data?.message || err.message); }
    setLoading(false);
  };

  const handleEdit = (student) => { setEditingId(student._id); setForm(student); setOpenDialog(true); };
  const handleDelete = async (id) => { 
    if (window.confirm('Delete this student?')) {
      try {
        const response = await axios.delete(`${apiUrl}/api/students/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.data.success) { setSuccess('Student deleted'); fetchStudents(); }
        else setError(response.data.message);
      } catch (err) { setError(err.response?.data?.message); }
    }
  };
  const handleClose = () => { setOpenDialog(false); setEditingId(null); setForm({ name: '', email: '', rollNumber: '', class: '', section: '', semester: '', parentName: '', parentPhone: '', address: '', dateOfBirth: '', gender: 'Male', status: 'Active' }); setError(''); setSuccess(''); };

  const statusColor = { Active: 'success', Inactive: 'default', Graduated: 'warning' };
  const getAvatarColor = (gender) => {
    if (gender === 'Female') return '#f48fb1';
    if (gender === 'Male') return '#64b5f6';
    return '#a5d6a7';
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box><Typography variant="h4" fontWeight={700}>Student Management</Typography><Typography variant="body2" color="text.secondary">Manage all students, view details, and perform actions</Typography></Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>Add Student</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      <Paper sx={{ p: 2, mb: 3 }}><TextField fullWidth placeholder="Search by name, email or roll number..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} /></Paper>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow><TableCell>Student</TableCell><TableCell>Roll No</TableCell><TableCell>Class</TableCell><TableCell>Email</TableCell><TableCell>Parent</TableCell><TableCell>Status</TableCell><TableCell align="center">Actions</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((student, idx) => (
              <TableRow key={student._id} hover sx={{ bgcolor: idx % 2 === 0 ? 'action.hover' : 'inherit' }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: getAvatarColor(student.gender), color: '#fff' }}>
                      {student.name?.charAt(0) || '?'}
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight={600}>{student.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{student.rollNumber}</TableCell>
                <TableCell>{student.class}{student.section && `-${student.section}`}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.parentName || '-'}</TableCell>
                <TableCell><Chip label={student.status} size="small" color={statusColor[student.status]} /></TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="primary" onClick={() => handleEdit(student)}><Edit /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(student._id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filtered.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, newPage) => setPage(newPage)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
      </TableContainer>
      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Full Name" name="name" value={form.name} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Roll Number" name="rollNumber" value={form.rollNumber} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Class" name="class" value={form.class} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Section" name="section" value={form.section} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Semester" name="semester" value={form.semester} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Parent Name" name="parentName" value={form.parentName} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Parent Phone" name="parentPhone" value={form.parentPhone} onChange={handleChange} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Address" name="address" value={form.address} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Date of Birth" type="date" name="dateOfBirth" value={form.dateOfBirth?.split('T')[0] || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Gender</InputLabel><Select name="gender" value={form.gender} label="Gender" onChange={handleChange}><MenuItem value="Male">Male</MenuItem><MenuItem value="Female">Female</MenuItem><MenuItem value="Other">Other</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Status</InputLabel><Select name="status" value={form.status} label="Status" onChange={handleChange}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem><MenuItem value="Graduated">Graduated</MenuItem></Select></FormControl></Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={handleClose}>Cancel</Button><Button variant="contained" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentManagementPage;

