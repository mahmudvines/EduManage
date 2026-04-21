import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Box, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Typography, Chip, Alert, TablePagination, InputAdornment
} from '@mui/material';
import { Edit, Delete, Add, Search } from '@mui/icons-material';

const ClassManagementPage = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    className: '', teacherId: '', teacherName: '', subject: '', dayOfWeek: 'Monday',
    startTime: '09:00', endTime: '10:00', durationMinutes: 60, room: '', semester: '',
    academicYear: '2024-2025', maxStudents: 30, status: 'Active'
  });
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const token = localStorage.getItem('token');

  const fetchClasses = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/classes`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setClasses(res.data.data);
    } catch (err) { setError('Failed to fetch classes'); }
  }, [apiUrl, token]);

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/auth/teachers`, { headers: { Authorization: `Bearer ${token}` } });
      setTeachers(res.data);
    } catch (err) { setError('Failed to fetch teachers'); }
  }, [apiUrl, token]);

  useEffect(() => { fetchClasses(); fetchTeachers(); }, [fetchClasses, fetchTeachers]);

  useEffect(() => {
    setFiltered(classes.filter(c => c.className?.toLowerCase().includes(search.toLowerCase()) || c.teacherName?.toLowerCase().includes(search.toLowerCase())));
    setPage(0);
  }, [search, classes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'teacherId') {
      const teacher = teachers.find(t => t._id === value);
      if (teacher) setForm(prev => ({ ...prev, teacherName: teacher.name }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      let response;
      if (editingId) {
        response = await axios.put(`${apiUrl}/api/classes/${editingId}`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        response = await axios.post(`${apiUrl}/api/classes`, form, { headers: { Authorization: `Bearer ${token}` } });
      }
      if (response.data.success) {
        setSuccess(editingId ? 'Class updated' : 'Class created');
        handleClose();
        fetchClasses();
      } else {
        setError(response.data.message || 'Operation failed');
      }
    } catch (err) { setError(err.response?.data?.message || err.message); }
    setLoading(false);
  };

  const handleEdit = (cls) => { setEditingId(cls._id); setForm(cls); setOpenDialog(true); };
  const handleDelete = async (id) => { if (window.confirm('Delete this class?')) { try { await axios.delete(`${apiUrl}/api/classes/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchClasses(); setSuccess('Class deleted'); } catch (err) { setError(err.response?.data?.message); } } };
  const handleClose = () => { setOpenDialog(false); setEditingId(null); setForm({ className: '', teacherId: '', teacherName: '', subject: '', dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00', durationMinutes: 60, room: '', semester: '', academicYear: '2024-2025', maxStudents: 30, status: 'Active' }); setError(''); setSuccess(''); };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box><Typography variant="h4" fontWeight={700}>Class Management</Typography><Typography variant="body2" color="text.secondary">Manage classes, assign teachers, and view schedules</Typography></Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>Add Class</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      <Paper sx={{ p: 2, mb: 3 }}><TextField fullWidth placeholder="Search by class name or teacher..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} /></Paper>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow><TableCell>Class</TableCell><TableCell>Teacher</TableCell><TableCell>Subject</TableCell><TableCell>Day</TableCell><TableCell>Time</TableCell><TableCell>Room</TableCell><TableCell>Semester</TableCell><TableCell>Status</TableCell><TableCell align="center">Actions</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((cls, idx) => (
              <TableRow key={cls._id} hover sx={{ bgcolor: idx % 2 === 0 ? 'action.hover' : 'inherit' }}>
                <TableCell>{cls.className}</TableCell>
                <TableCell>{cls.teacherName}</TableCell>
                <TableCell>{cls.subject}</TableCell>
                <TableCell><Chip label={cls.dayOfWeek} size="small" /></TableCell>
                <TableCell>{cls.startTime} - {cls.endTime}</TableCell>
                <TableCell>{cls.room}</TableCell>
                <TableCell>{cls.semester}</TableCell>
                <TableCell><Chip label={cls.status} size="small" color={cls.status === 'Active' ? 'success' : 'default'} /></TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="primary" onClick={() => handleEdit(cls)}><Edit /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(cls._id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filtered.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, newPage) => setPage(newPage)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
      </TableContainer>
      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Class' : 'Add New Class'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Class Name" name="className" value={form.className} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Teacher</InputLabel><Select name="teacherId" value={form.teacherId} label="Teacher" onChange={handleChange} required><MenuItem value="">Select Teacher</MenuItem>{teachers.map(t => <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Subject" name="subject" value={form.subject} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Day of Week</InputLabel><Select name="dayOfWeek" value={form.dayOfWeek} label="Day of Week" onChange={handleChange}><MenuItem>Monday</MenuItem><MenuItem>Tuesday</MenuItem><MenuItem>Wednesday</MenuItem><MenuItem>Thursday</MenuItem><MenuItem>Friday</MenuItem><MenuItem>Saturday</MenuItem><MenuItem>Sunday</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Start Time" type="time" name="startTime" value={form.startTime} onChange={handleChange} required InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="End Time" type="time" name="endTime" value={form.endTime} onChange={handleChange} required InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Duration (minutes)" type="number" name="durationMinutes" value={form.durationMinutes} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Room" name="room" value={form.room} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Semester" name="semester" value={form.semester} onChange={handleChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Academic Year" name="academicYear" value={form.academicYear} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Max Students" type="number" name="maxStudents" value={form.maxStudents} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Status</InputLabel><Select name="status" value={form.status} label="Status" onChange={handleChange}><MenuItem>Active</MenuItem><MenuItem>Inactive</MenuItem><MenuItem>Completed</MenuItem></Select></FormControl></Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={handleClose}>Cancel</Button><Button variant="contained" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassManagementPage;
