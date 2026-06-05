import React from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function StatCard({ label, value, icon: Icon, color = 'primary', onClick }) {
  const interactive = typeof onClick === 'function';
  return (
    <Card
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      sx={{
        p: 2.5,
        height: '100%',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'transform .18s ease, box-shadow .18s ease',
        '&:hover': interactive
          ? {
              transform: 'translateY(-3px)',
              boxShadow: '0 6px 16px rgba(15,23,42,0.12)',
            }
          : {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
            },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {Icon ? (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: `${color}.main`,
              bgcolor: `${color}.light`,
            }}
          >
            <Icon />
          </Box>
        ) : null}

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {label}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}
