import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export default function Loader({ label }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 6,
        minHeight: 160,
      }}
    >
      <CircularProgress color="primary" />
      {label ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
      ) : null}
    </Box>
  );
}
