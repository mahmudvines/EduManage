import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box } from '@mui/material';

const ClassScheduleTable = ({ schedules }) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
      <Table sx={{ minWidth: 500 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell>Class</TableCell>
            <TableCell>Teacher</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Day</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Room</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow key={schedule.id} hover>
              <TableCell>{schedule.className}</TableCell>
              <TableCell>{schedule.teacherName}</TableCell>
              <TableCell>{schedule.subject}</TableCell>
              <TableCell><Chip label={schedule.dayOfWeek} size="small" /></TableCell>
              <TableCell>{schedule.startTime} - {schedule.endTime}</TableCell>
              <TableCell>{schedule.room}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ClassScheduleTable;
