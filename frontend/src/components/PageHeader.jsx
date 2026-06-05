import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      sx={{ mb: 4 }}
    >
      <Box>
        <Typography variant="h4" component="h1" sx={{ color: 'text.primary' }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>

      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Stack>
  );
}
