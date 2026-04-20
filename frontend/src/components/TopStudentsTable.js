import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Chip, Typography, Box } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const TopStudentsTable = ({ students }) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
      <Table sx={{ minWidth: 500 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell>Student</TableCell>
            <TableCell>Roll Number</TableCell>
            <TableCell>Class</TableCell>
            <TableCell>Attendance</TableCell>
            <TableCell>Performance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>{student.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>{student.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{student.email}</Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{student.rollNumber}</TableCell>
              <TableCell>{student.class}</TableCell>
              <TableCell><Chip label={`${student.attendance}%`} size="small" color={student.attendance >= 85 ? 'success' : student.attendance >= 70 ? 'warning' : 'error'} /></TableCell>
              <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><TrendingUp fontSize="small" color="success" />{student.performance} GPA</Box></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TopStudentsTable;
