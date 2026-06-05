import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

export default function EmptyState({
  icon: Icon = InboxOutlinedIcon,
  title,
  description,
  action,
}) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: { xs: 6, sm: 8 },
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          color: 'text.secondary',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Icon fontSize="large" />
      </Box>

      <Typography variant="h6" sx={{ color: 'text.primary' }}>
        {title}
      </Typography>

      {description ? (
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', maxWidth: 420 }}
        >
          {description}
        </Typography>
      ) : null}

      {action ? <Box sx={{ mt: 1 }}>{action}</Box> : null}
    </Box>
  );
}
