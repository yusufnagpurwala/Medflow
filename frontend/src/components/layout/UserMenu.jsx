import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAuthStore } from '@/store/authStore';

export default function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const name = user?.name || 'User';
  const role = user?.role || '';
  const email = user?.email || '';
  const initial = name.charAt(0).toUpperCase();

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleClose();
    await useAuthStore.getState().logout();
    router.push('/login');
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        color="inherit"
        sx={{ textTransform: 'none', px: 1, borderRadius: 2 }}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {initial}
          </Avatar>
          <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
              {name}
            </Typography>
            {role ? (
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                {role}
              </Typography>
            ) : null}
          </Box>
          <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} fontSize="small" />
        </Stack>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 220, borderRadius: 2 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.primary' }} noWrap>
            {name}
          </Typography>
          {email ? (
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap component="div">
              {email}
            </Typography>
          ) : null}
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main', mt: 0.5 }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
