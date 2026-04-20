import React from 'react';
import { Card, CardContent, Typography, Button, Box, AvatarGroup, Avatar } from '@mui/material';
import { School, TrendingUp } from '@mui/icons-material';

const WelcomeBanner = () => {
  return (
    <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>Welcome back, Admin!</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>Here's what's happening with your school today.</Typography>
            <Button variant="contained" sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }} startIcon={<TrendingUp />}>View Report</Button>
          </Box>
          <AvatarGroup max={4}>
            <Avatar sx={{ bgcolor: '#FF6B6B' }}>JD</Avatar>
            <Avatar sx={{ bgcolor: '#4ECDC4' }}>MK</Avatar>
            <Avatar sx={{ bgcolor: '#45B7D1' }}>AL</Avatar>
            <Avatar sx={{ bgcolor: '#96CEB4' }}>SW</Avatar>
          </AvatarGroup>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WelcomeBanner;
