import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Paper, Grid, Card, CardContent, Avatar, Button, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { School, Class, Assignment, TrendingUp, CalendarToday, Person } from '@mui/icons-material';

const StudentDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({ student: null, classes: [], grades: [], attendance: [] });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const res = await axios.get(`${apiUrl}/api/student/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) setDashboardData(res.data.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Student Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Welcome, {dashboardData.student?.name || user?.name}</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}><Person /></Avatar>
            <Box><Typography variant="subtitle2">Roll Number</Typography><Typography variant="h6">{dashboardData.student?.rollNumber || 'N/A'}</Typography></Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}><School /></Avatar>
            <Box><Typography variant="subtitle2">Class</Typography><Typography variant="h6">{dashboardData.student?.class || 'N/A'} {dashboardData.student?.section}</Typography></Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}><TrendingUp /></Avatar>
            <Box><Typography variant="subtitle2">Overall GPA</Typography><Typography variant="h6">3.8</Typography></Box>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="My Classes" icon={<Class />} iconPosition="start" />
          <Tab label="Grades & Results" icon={<Assignment />} iconPosition="start" />
          <Tab label="Attendance" icon={<CalendarToday />} iconPosition="start" />
          <Tab label="Profile" icon={<Person />} iconPosition="start" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <TableContainer>
              <Table><TableHead><TableRow><TableCell>Class Name</TableCell><TableCell>Teacher</TableCell><TableCell>Subject</TableCell><TableCell>Day</TableCell><TableCell>Time</TableCell><TableCell>Room</TableCell></TableRow></TableHead>
              <TableBody>{dashboardData.classes.map((cls) => (<TableRow key={cls._id}><TableCell>{cls.className}</TableCell><TableCell>{cls.teacherName}</TableCell><TableCell>{cls.subject}</TableCell><TableCell>{cls.dayOfWeek}</TableCell><TableCell>{cls.startTime} - {cls.endTime}</TableCell><TableCell>{cls.room}</TableCell></TableRow>))}</TableBody></Table>
            </TableContainer>
          )}
          {tabValue === 1 && <Typography>Grades and results will be shown here (mock data).</Typography>}
          {tabValue === 2 && <Typography>Attendance records will be shown here (mock data).</Typography>}
          {tabValue === 3 && (
            <Box><Typography variant="h6">Profile Information</Typography>
            <Typography><strong>Name:</strong> {dashboardData.student?.name}</Typography>
            <Typography><strong>Email:</strong> {dashboardData.student?.email}</Typography>
            <Typography><strong>Parent Name:</strong> {dashboardData.student?.parentName}</Typography>
            <Button variant="contained" sx={{ mt: 2 }}>Edit Profile</Button></Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default StudentDashboardPage;
