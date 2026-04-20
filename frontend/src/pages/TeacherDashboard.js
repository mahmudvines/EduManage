import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Grid, Paper, Typography, Box, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Class, People, Assignment, Grade, CalendarToday } from '@mui/icons-material';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({ totalClasses: 0, totalStudents: 0, pendingAssignments: 0 });

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classesRes = await axios.get(`${apiUrl}/api/teacher/classes`, { headers: { Authorization: `Bearer ${token}` } });
        const studentsRes = await axios.get(`${apiUrl}/api/teacher/students`, { headers: { Authorization: `Bearer ${token}` } });
        const assignmentsRes = await axios.get(`${apiUrl}/api/teacher/assignments`, { headers: { Authorization: `Bearer ${token}` } });
        setClasses(classesRes.data);
        setStudents(studentsRes.data);
        setAssignments(assignmentsRes.data);
        setStats({
          totalClasses: classesRes.data.length,
          totalStudents: studentsRes.data.length,
          pendingAssignments: assignmentsRes.data.filter(a => !a.submitted).length
        });
      } catch (err) { console.error(err); }
    };
    if (user) fetchData();
  }, [user]);

  const statCards = [
    { title: 'My Classes', value: stats.totalClasses, icon: Class, color: '#3b82f6' },
    { title: 'Total Students', value: stats.totalStudents, icon: People, color: '#10b981' },
    { title: 'Pending Assignments', value: stats.pendingAssignments, icon: Assignment, color: '#f59e0b' },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Teacher Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Welcome back, {user?.name}! Manage your classes and students.</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, idx) => (
          <Grid item xs={12} sm={4} key={idx}>
            <Card sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box><Typography variant="subtitle2" color="text.secondary">{card.title}</Typography><Typography variant="h4" fontWeight={700}>{card.value}</Typography></Box>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${card.color}15` }}><card.icon sx={{ color: card.color, fontSize: 32 }} /></Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>My Classes</Typography>
            <TableContainer>
              <Table>
                <TableHead><TableRow><TableCell>Class</TableCell><TableCell>Subject</TableCell><TableCell>Schedule</TableCell><TableCell>Room</TableCell></TableRow></TableHead>
                <TableBody>
                  {classes.map(cls => (
                    <TableRow key={cls._id}><TableCell>{cls.className}</TableCell><TableCell>{cls.subject}</TableCell><TableCell>{cls.dayOfWeek} {cls.startTime}-{cls.endTime}</TableCell><TableCell>{cls.room}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Recent Assignments</Typography>
            <TableContainer>
              <Table>
                <TableHead><TableRow><TableCell>Title</TableCell><TableCell>Due Date</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                <TableBody>
                  {assignments.slice(0, 5).map(ass => (
                    <TableRow key={ass._id}><TableCell>{ass.title}</TableCell><TableCell>{new Date(ass.dueDate).toLocaleDateString()}</TableCell><TableCell><Chip label={ass.submitted ? 'Submitted' : 'Pending'} size="small" color={ass.submitted ? 'success' : 'warning'} /></TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherDashboard;
