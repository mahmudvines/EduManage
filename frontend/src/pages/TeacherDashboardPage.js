import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Paper, Grid, Card, CardContent, Avatar, Button, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Class, People, Assignment, Grade, Person } from '@mui/icons-material';

const TeacherDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({ teacher: null, classes: [], students: [] });
  const [tabValue, setTabValue] = useState(0);
  const [openGradeDialog, setOpenGradeDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeForm, setGradeForm] = useState({ subject: '', grade: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const res = await axios.get(`${apiUrl}/api/teacher/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) setDashboardData(res.data.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => setTabValue(newValue);
  const handleGradeSubmit = async () => {
    setOpenGradeDialog(false);
    alert('Grade submitted');
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Teacher Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Welcome, {user?.name}</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}><Class /></Avatar>
            <Box><Typography variant="subtitle2">My Classes</Typography><Typography variant="h6">{dashboardData.classes.length}</Typography></Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}><People /></Avatar>
            <Box><Typography variant="subtitle2">My Students</Typography><Typography variant="h6">{dashboardData.students.length}</Typography></Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}><Assignment /></Avatar>
            <Box><Typography variant="subtitle2">Pending Assignments</Typography><Typography variant="h6">3</Typography></Box>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="My Classes" icon={<Class />} iconPosition="start" />
          <Tab label="My Students" icon={<People />} iconPosition="start" />
          <Tab label="Assignments" icon={<Assignment />} iconPosition="start" />
          <Tab label="Attendance & Grades" icon={<Grade />} iconPosition="start" />
          <Tab label="Profile" icon={<Person />} iconPosition="start" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>Class Name</TableCell><TableCell>Subject</TableCell><TableCell>Day</TableCell><TableCell>Time</TableCell><TableCell>Room</TableCell></TableRow></TableHead>
            <TableBody>{dashboardData.classes.map((cls) => (<TableRow key={cls._id}><TableCell>{cls.className}</TableCell><TableCell>{cls.subject}</TableCell><TableCell>{cls.dayOfWeek}</TableCell><TableCell>{cls.startTime} - {cls.endTime}</TableCell><TableCell>{cls.room}</TableCell></TableRow>))}</TableBody></Table></TableContainer>
          )}
          {tabValue === 1 && (
            <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>Student Name</TableCell><TableCell>Roll No</TableCell><TableCell>Class</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
            <TableBody>{dashboardData.students.map((s) => (<TableRow key={s._id}><TableCell>{s.name}</TableCell><TableCell>{s.rollNumber}</TableCell><TableCell>{s.class}</TableCell><TableCell><Button size="small" variant="outlined" onClick={() => { setSelectedStudent(s); setOpenGradeDialog(true); }}>Enter Grade</Button></TableCell></TableRow>))}</TableBody></Table></TableContainer>
          )}
          {tabValue === 2 && <Typography>Assignments management will appear here.</Typography>}
          {tabValue === 3 && <Typography>Attendance and grades entry will appear here.</Typography>}
          {tabValue === 4 && (
            <Box>
              <Typography variant="h6">Teacher Profile</Typography>
              <Typography><strong>Name:</strong> {user?.name}</Typography>
              <Typography><strong>Email:</strong> {user?.email}</Typography>
              <Typography><strong>Department:</strong> {user?.department}</Typography>
              <Button variant="contained" sx={{ mt: 2 }}>Edit Profile</Button>
            </Box>
          )}
        </Box>
      </Paper>

      <Dialog open={openGradeDialog} onClose={() => setOpenGradeDialog(false)}>
        <DialogTitle>Enter Grade for {selectedStudent?.name}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Subject" value={gradeForm.subject} onChange={(e) => setGradeForm({ ...gradeForm, subject: e.target.value })} sx={{ mt: 1 }} />
          <TextField fullWidth label="Grade" value={gradeForm.grade} onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGradeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGradeSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherDashboardPage;
