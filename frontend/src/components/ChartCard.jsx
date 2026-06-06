import React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ResponsiveContainer } from 'recharts';

export default function ChartCard({ title, subtitle, children, height }) {
  return (
    <Card sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'text.primary', lineHeight: 1.3 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>

      <ResponsiveContainer width="100%" height={height || 260}>
        {children}
      </ResponsiveContainer>
    </Card>
  );
}
