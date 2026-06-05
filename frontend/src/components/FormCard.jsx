import React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function FormCard({ title, subtitle, children, maxWidth = 440 }) {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Card sx={{ width: '100%', maxWidth, p: { xs: 3, sm: 4 } }}>
        {(title || subtitle) && (
          <Box sx={{ mb: 3 }}>
            {title ? (
              <Typography variant="h5" component="h1" sx={{ color: 'text.primary' }}>
                {title}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        )}
        {children}
      </Card>
    </Box>
  );
}
