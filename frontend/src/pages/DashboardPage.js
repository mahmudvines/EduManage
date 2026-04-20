import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Card, CardContent, Avatar,
  LinearProgress, Stack, Chip, Divider
} from '@mui/material';
import {
  People, School, TrendingUp, MenuBook, AttachMoney, Assignment
} from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0, activeStudents: 0,
    totalClasses: 0, ongoingCourses: 0,
    totalTeachers: 0, monthlyRevenue: 0
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [teacherWorkload, setTeacherWorkload] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const [statsRes, attendanceRes, courseRes, studentsRes, classesRes] = await Promise.all([
          axios.get(`${apiUrl}/api/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/api/dashboard/attendance`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/api/dashboard/course-enrollment`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/api/students`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/api/classes`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const statsData = statsRes.data.data;
        const ongoingCount = classesRes.data.data.filter(c => c.status !== 'Completed').length;
        setStats({
          totalStudents: statsData.totalStudents,
          activeStudents: statsData.activeStudents,
          totalClasses: statsData.totalClasses,
          ongoingCourses: ongoingCount,
          totalTeachers: Math.floor(statsData.totalStudents / 20) || 5,
          monthlyRevenue: (statsData.totalStudents * 500) || 50000
        });
        setAttendanceData(attendanceRes.data.data);
        setCourseData(courseRes.data.data);
        
        setTopStudents(studentsRes.data.data.slice(0, 5).map(s => ({
          id: s._id, name: s.name, rollNumber: s.rollNumber,
          class: `${s.class}${s.section ? `-${s.section}` : ''}`,
          attendance: Math.floor(Math.random() * 30) + 70,
          performance: (Math.random() * 2 + 3).toFixed(1)
        })));
        
        setRecentActivities([
          { id: 1, action: 'New student enrolled', time: '2 hours ago', user: 'John Doe', icon: <People fontSize="small" /> },
          { id: 2, action: 'Class schedule updated', time: '5 hours ago', user: 'Admin', icon: <School fontSize="small" /> },
          { id: 3, action: 'Fee payment received', time: '1 day ago', user: 'Sarah Smith', icon: <AttachMoney fontSize="small" /> },
          { id: 4, action: 'New teacher assigned', time: '2 days ago', user: 'Dr. Williams', icon: <Assignment fontSize="small" /> },
        ]);
        
        setTeacherWorkload([
          { name: 'Mr. Smith', classes: 4, students: 85 },
          { name: 'Ms. Johnson', classes: 3, students: 62 },
          { name: 'Dr. Brown', classes: 5, students: 98 },
          { name: 'Mrs. Davis', classes: 2, students: 41 },
        ]);
      } catch (err) { console.error(err); }
    };
    if (user) fetchData();
  }, [user]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</Box>;

  const kpis = [
    { title: 'Total Students', value: stats.totalStudents, change: '+12%', icon: People, color: '#3b82f6', link: '/students-detail' },
    { title: 'Active Students', value: stats.activeStudents, change: '+5%', icon: TrendingUp, color: '#10b981', link: '/active-students' },
    { title: 'Total Classes', value: stats.totalClasses, change: '+8%', icon: School, color: '#f59e0b', link: '/classes-detail' },
    { title: 'Ongoing Courses', value: stats.ongoingCourses, change: '+3%', icon: MenuBook, color: '#8b5cf6', link: '/ongoing-courses' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Welcome back, {user?.name}</Typography>

      {/* KPI Cards Row - each 300px, gap 32px */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '32px', 
        mb: '32px',
        '& > *': { width: { xs: '100%', sm: 'calc(50% - 16px)', md: '300px' } }
      }}>
        {kpis.map((kpi, idx) => (
          <Card key={idx} sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }} onClick={() => navigate(kpi.link)}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" fontWeight={600}>{kpi.title}</Typography>
                <Avatar sx={{ bgcolor: `${kpi.color}20`, color: kpi.color, width: 40, height: 40 }}><kpi.icon /></Avatar>
              </Box>
              <Typography variant="h4" fontWeight={700}>{kpi.value.toLocaleString()}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Chip label={kpi.change} size="small" color={kpi.change.includes('+') ? 'success' : 'error'} variant="outlined" />
                <Typography variant="caption" color="text.secondary">vs last month</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Charts Row: Attendance 800px, Course 370px, gap 32px */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '32px', 
        mb: '32px',
        '& > :first-child': { width: { xs: '100%', md: '800px' }, flex: { xs: '1 1 auto', md: '0 0 auto' } },
        '& > :last-child': { width: { xs: '100%', md: '370px' }, flex: { xs: '1 1 auto', md: '0 0 auto' } }
      }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Attendance Overview</Typography>
          <Box sx={{ height: 350, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="present" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Present %" />
                <Area type="monotone" dataKey="absent" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Absent %" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Course Enrollment</Typography>
          <Box sx={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={courseData} dataKey="students" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {courseData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>

      {/* Second Row: Top Students 850px, Recent Activities 300px, gap 32px */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '32px', 
        mb: '32px',
        '& > :first-child': { width: { xs: '100%', md: '850px' }, flex: { xs: '1 1 auto', md: '0 0 auto' } },
        '& > :last-child': { width: { xs: '100%', md: '300px' }, flex: { xs: '1 1 auto', md: '0 0 auto' } }
      }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Top Performing Students</Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Student</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Roll No</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Class</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Attendance</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>GPA</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((student) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '8px' }}>{student.name}</td>
                    <td style={{ padding: '8px' }}>{student.rollNumber}</td>
                    <td style={{ padding: '8px' }}>{student.class}</td>
                    <td style={{ padding: '8px' }}><Chip label={`${student.attendance}%`} size="small" color={student.attendance >= 85 ? 'success' : 'warning'} /></td>
                    <td style={{ padding: '8px' }}>{student.performance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Recent Activities</Typography>
          <Stack spacing={2}>
            {recentActivities.map((activity) => (
              <Box key={activity.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Avatar sx={{ bgcolor: 'primary.lighter', width: 32, height: 32 }}>{activity.icon}</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={500}>{activity.action}</Typography>
                  <Typography variant="caption" color="text.secondary">by {activity.user} • {activity.time}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Box>

      {/* Third Row: Teacher Workload 850px, System Health 320px, gap 32px */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '32px',
        '& > :first-child': { width: { xs: '100%', md: '850px' }, flex: { xs: '1 1 auto', md: '0 0 auto' } },
        '& > :last-child': { width: { xs: '100%', md: '320px' }, flex: { xs: '1 1 auto', md: '0 0 auto' } }
      }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Teacher Workload</Typography>
          <Box sx={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teacherWorkload}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="classes" fill="#3b82f6" name="Classes" />
                <Bar yAxisId="right" dataKey="students" fill="#10b981" name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>System Health</Typography>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Server Uptime</Typography>
                <Typography variant="body2" fontWeight={600}>99.9%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={99.9} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Database Usage</Typography>
                <Typography variant="body2" fontWeight={600}>45%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={45} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">API Response Time</Typography>
                <Typography variant="body2" fontWeight={600}>245ms</Typography>
              </Box>
              <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Total Revenue (Monthly)</Typography>
              <Typography variant="h6" fontWeight={700} color="success.main">${stats.monthlyRevenue.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Student-Teacher Ratio</Typography>
              <Typography variant="h6" fontWeight={700}>{(stats.totalStudents / stats.totalTeachers).toFixed(1)}:1</Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default DashboardPage;
