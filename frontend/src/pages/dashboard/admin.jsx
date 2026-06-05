import React, { useEffect, useState } from 'react';
import { Box, Button, Snackbar, Alert, Typography } from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import PeopleIcon from '@mui/icons-material/People';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  AppShell,
  PageHeader,
  StatCard,
  DataTable,
  EmptyState,
  Loader,
} from '@/components';

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isHydrated, router, user]);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/doctors/pending'),
      ]);
      setStats(statsRes.data.data || null);
      setPending(pendingRes.data.data || []);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to load admin data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user]);

  const handleAction = async (id, action) => {
    if (actioningId) return; // block overlapping mutations
    setActioningId(id);
    try {
      await api.patch(`/admin/doctors/${id}/${action}`);
      // optimistic: drop the row immediately so it can't be acted on twice
      setPending((prev) => prev.filter((d) => d._id !== id));
      setSnackbar({
        open: true,
        message: action === 'approve' ? 'Doctor approved' : 'Doctor rejected',
        severity: 'success',
      });
      fetchData(); // re-sync stats + pending from server
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || `Failed to ${action} doctor`,
        severity: 'error',
      });
    } finally {
      setActioningId(null);
    }
  };

  const statCards = [
    {
      label: 'Patients',
      value: stats?.patients ?? 0,
      icon: PeopleIcon,
      color: 'primary',
      onClick: () => router.push('/admin/patients'),
    },
    {
      label: 'Doctors',
      value: stats?.doctors ?? 0,
      icon: MedicalServicesIcon,
      color: 'primary',
      onClick: () => router.push('/admin/doctors'),
    },
    {
      label: 'Pending Doctors',
      value: stats?.pendingDoctors ?? 0,
      icon: HourglassEmptyIcon,
      color: 'warning',
      onClick: () => router.push('/admin/doctors?status=pending'),
    },
    {
      label: 'Appointments',
      value: stats?.appointments ?? 0,
      icon: EventIcon,
      color: 'primary',
      onClick: () => router.push('/admin/appointments'),
    },
  ];

  const columns = [
    { field: 'name', headerName: 'Name', width: 160 },
    { field: 'email', headerName: 'Email', width: 220 },
    {
      field: 'specialization',
      headerName: 'Specialization',
      width: 160,
      renderCell: (params) => params.value || 'N/A',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="success"
            size="small"
            disabled={actioningId === params.row._id}
            onClick={() => handleAction(params.row._id, 'approve')}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            disabled={actioningId === params.row._id}
            onClick={() => handleAction(params.row._id, 'reject')}
          >
            Reject
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <AppShell title="Admin">
      <PageHeader
        title={`Welcome, ${user?.name || 'Admin'}`}
        subtitle="Admin control panel"
      />

      {loading ? (
        <Loader />
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              mb: 4,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
            }}
          >
            {statCards.map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
                color={card.color}
                onClick={card.onClick}
              />
            ))}
          </Box>

          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
            Pending Doctor Approvals
          </Typography>

          {pending.length === 0 ? (
            <EmptyState
              icon={CheckCircleIcon}
              title="All caught up"
              description="No pending doctor requests."
            />
          ) : (
            <DataTable rows={pending} columns={columns} />
          )}
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppShell>
  );
}
