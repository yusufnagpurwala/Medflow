import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useAuthStore } from '@/store/authStore';
import UserMenu from './UserMenu';
import ThemeToggle from '../ThemeToggle';

const SIDEBAR_WIDTH = 248;

// Role-aware navigation map.
const NAV_BY_ROLE = {
  patient: [
    { label: 'Dashboard', href: '/dashboard/patient', icon: DashboardIcon },
    { label: 'Book Appointment', href: '/appointment/create-appointment', icon: EventIcon },
  ],
  doctor: [
    { label: 'Dashboard', href: '/dashboard/doctor', icon: DashboardIcon },
    { label: 'Availability', href: '/availability', icon: EventAvailableIcon },
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard/admin', icon: DashboardIcon },
    { label: 'Doctors', href: '/admin/doctors', icon: MedicalServicesIcon },
    { label: 'Patients', href: '/admin/patients', icon: PeopleIcon },
    { label: 'Appointments', href: '/admin/appointments', icon: EventIcon },
  ],
};

// Brand wordmark used at the top of the sidebar.
function Brand() {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ px: 2.5, height: 64, flexShrink: 0 }}
    >
      <LocalHospitalIcon sx={{ color: 'primary.main', fontSize: 28 }} />
      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
        MedFlow
      </Typography>
    </Stack>
  );
}

// Sidebar inner content — shared by the permanent and temporary drawers.
function SidebarContent({ navItems, currentPath, onNavigate }) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Brand />
      <List sx={{ px: 1.5, py: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPath === item.href;
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={onNavigate}
                selected={active}
                sx={{
                  borderRadius: 2,
                  color: active ? 'primary.main' : 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                    '&:hover': { bgcolor: 'primary.light' },
                  },
                }}
              >
                <ListItemIcon
                  sx={{ minWidth: 40, color: active ? 'primary.dark' : 'text.secondary' }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: active ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}


export default function AppShell({ children, title }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role;
  const navItems = NAV_BY_ROLE[role] || [];
  const currentPath = router.pathname;

  const toggleDrawer = () => setMobileOpen((v) => !v);
  const closeDrawer = () => setMobileOpen(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Permanent sidebar (md+) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          },
        }}
        open
      >
        <SidebarContent navItems={navItems} currentPath={currentPath} />
      </Drawer>

      {/* Temporary sidebar (below md) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={closeDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
          },
        }}
      >
        <SidebarContent
          navItems={navItems}
          currentPath={currentPath}
          onNavigate={closeDrawer}
        />
      </Drawer>

      {/* Main column */}
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        }}
      >
        <AppBar position="sticky">
          <Toolbar>
            <IconButton
              edge="start"
              onClick={toggleDrawer}
              aria-label="Open navigation"
              sx={{ mr: 1, display: { md: 'none' }, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>

            {title ? (
              <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {title}
              </Typography>
            ) : null}

            <Box sx={{ flexGrow: 1 }} />
            <ThemeToggle sx={{ mr: 0.5 }} />
            <UserMenu />
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}
