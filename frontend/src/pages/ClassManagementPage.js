import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Box, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Typography, Chip, Alert, Snackbar
} from '@mui/material';
import { Add, Edit, Delete, Close } from '@mui/icons-material';

const ClassManagementPage = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: 'success' });
  const [form, setForm] = useState({
    className: '',
    teacherId: '',
    teacherName: '',
    subject: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    room: '',
    semester: 'Fall 2024'
  });

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const token = localStorage.getItem('token');

  // Fetch classes and teachers
  const fetchData = async () => {
    try {
      const [classesRes, teachersRes] = await Promise.all([
        axios.get(`${apiUrl}/api/classes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/api/auth/teachers`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setClasses(classesRes.data.data || []);
      setTeachers(teachersRes.data || []);
    } catch (err) {
      console.error('Fetch error', err);
      showMessage('Failed to load data', 'error');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showMessage = (text, severity) => {
    setMessage({ text, severity });
    setTimeout(() => setMessage({ text: '', severity: 'success' }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'teacherId') {
      const teacher = teachers.find(t => t._id === value);
      if (teacher) setForm(prev => ({ ...prev, teacherName: teacher.name }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${apiUrl}/api/classes/${editingId}`, form, { headers: { Authorization: `Bearer ${token}` } });
        showMessage('Class updated successfully', 'success');
      } else {
        await axios.post(`${apiUrl}/api/classes`, form, { headers: { Authorization: `Bearer ${token}` } });
        showMessage('Class created successfully', 'success');
      }
      handleClose();
      fetchData();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Operation failed', 'error');
    }
    setLoading(false);
  };

  const handleEdit = (cls) => {
    setEditingId(cls._id);
    setForm({
      className: cls.className,
      teacherId: cls.teacherId?._id || cls.teacherId,
      teacherName: cls.teacherName,
      subject: cls.subject,
      dayOfWeek: cls.dayOfWeek,
      startTime: cls.startTime,
      endTime: cls.endTime,
      room: cls.room,
      semester: cls.semester
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this class?')) {
      try {
        await axios.delete(`${apiUrl}/api/classes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        showMessage('Class deleted', 'success');
        fetchData();
      } catch (err) {
        showMessage('Delete failed', 'error');
      }
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingId(null);
    setForm({
      className: '',
      teacherId: '',
      teacherName: '',
      subject: '',
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      room: '',
      semester: 'Fall 2024'
    });
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const semesters = ['Spring 2024', 'Summer 2024', 'Fall 2024', 'Spring 2025', 'Fall 2025'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Class Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
          Add Class
        </Button>
      </Box>

      <Snackbar open={!!message.text} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={message.severity} sx={{ width: '100%' }}>{message.text}</Alert>
      </Snackbar>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell>Class Name</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Day</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map((cls) => (
              <TableRow key={cls._id} hover>
                <TableCell>{cls.className}</TableCell>
                <TableCell>{cls.teacherName}</TableCell>
                <TableCell>{cls.subject}</TableCell>
                <TableCell><Chip label={cls.dayOfWeek} size="small" /></TableCell>
                <TableCell>{cls.startTime} - {cls.endTime}</TableCell>
                <TableCell>{cls.room}</TableCell>
                <TableCell>{cls.semester}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="primary" onClick={() => handleEdit(cls)}><Edit /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(cls._id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {classes.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No classes found. Click "Add Class" to create one.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Class' : 'Add New Class'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Class Name" name="className" value={form.className} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Teacher</InputLabel>
                <Select name="teacherId" value={form.teacherId} label="Teacher" onChange={handleChange} required>
                  <MenuItem value="">Select Teacher</MenuItem>
                  {teachers.map(t => <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Subject" name="subject" value={form.subject} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Day of Week</InputLabel>
                <Select name="dayOfWeek" value={form.dayOfWeek} label="Day of Week" onChange={handleChange}>
                  {daysOfWeek.map(day => <MenuItem key={day} value={day}>{day}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="Start Time" type="time" name="startTime" value={form.startTime} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="End Time" type="time" name="endTime" value={form.endTime} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Room" name="room" value={form.room} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Semester</InputLabel>
                <Select name="semester" value={form.semester} label="Semester" onChange={handleChange}>
                  {semesters.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassManagementPage;
