import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, Tooltip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const KPICard = ({ title, value, subtitle, icon: Icon, color, trend, trendValue, onClick }) => {
  const trendIcon = trend === 'up' ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />;
  const trendColor = trend === 'up' ? 'success.main' : 'error.main';

  return (
    <Card sx={{ cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }} onClick={onClick}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>{title}</Typography>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}15` }}>
            <Icon sx={{ color: color, fontSize: 28 }} />
          </Box>
        </Box>
        <Typography variant="h4" fontWeight={700}>{value}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: trendColor }}>
            {trendIcon}
            <Typography variant="caption" fontWeight={600} sx={{ ml: 0.5 }}>{trendValue}</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KPICard;
