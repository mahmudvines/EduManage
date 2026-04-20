import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography } from '@mui/material';

const StandardTable = ({ columns, data, emptyMessage = 'No data available' }) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: 'background.default' }}>
          <TableRow>
            {columns.map((col, idx) => (
              <TableCell key={idx} sx={{ fontWeight: 600 }}>{col.header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>{emptyMessage}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIdx) => (
              <TableRow key={row.id || rowIdx} hover>
                {columns.map((col, colIdx) => (
                  <TableCell key={colIdx}>
                    {col.render ? col.render(row) : row[col.field] || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StandardTable;
