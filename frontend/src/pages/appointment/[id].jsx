import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  MenuItem,
  Select,
  FormControl,
  Snackbar,
  Alert,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import { useRouter } from 'next/router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import NotesIcon from '@mui/icons-material/Notes';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { TimeIcon } from '@mui/x-date-pickers';
import { AppShell, PageHeader, StatusChip, Loader, EmptyState } from '@/components';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.light',
          color: 'primary.dark',
          flexShrink: 0,
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.primary' }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function AppointmentDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'doctor') {
      router.push('/login');
    }
  }, [isHydrated, user, router]);

  useEffect(() => {
    if (!id) return;

    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/appointments/${id}`);
        setAppointment(res.data.data);
        setStatus(res.data.data.status);
      } catch (err) {
        // swallow fetch error; UI falls back to not-found state
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);

    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const backAction = (
    <Button
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      onClick={() => router.push('/dashboard/doctor')}
    >
      Back to Dashboard
    </Button>
  );

  if (loading) {
    return (
      <AppShell title="Appointment">
        <Loader label="Loading appointment..." />
      </AppShell>
    );
  }

  if (!appointment) {
    return (
      <AppShell title="Appointment">
        <PageHeader title="Appointment Details" action={backAction} />
        <EmptyState icon={SearchOffIcon} title="Appointment not found" />
      </AppShell>
    );
  }

  return (
    <AppShell title="Appointment">
      <PageHeader title="Appointment Details" action={backAction} />

      <Card sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            Details
          </Typography>
          <StatusChip status={status} />
        </Stack>

        <Stack spacing={2.5}>
          <InfoRow
            icon={MedicalServicesIcon}
            label="Doctor"
            value={appointment.doctorId?.name || 'N/A'}
          />
          <InfoRow
            icon={PersonIcon}
            label="Patient Name"
            value={appointment.patientId?.name || 'N/A'}
          />
          <InfoRow
            icon={EventIcon}
            label="Date"
            value={new Date(appointment.appointmentDate).toLocaleDateString()}
          />
          <InfoRow
            icon={TimeIcon}
            label="Time"
            value={new Date(appointment.appointmentDate).toLocaleTimeString()}
          />
          <InfoRow
            icon={NotesIcon}
            label="Reason"
            value={appointment.reason || 'N/A'}
          />
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
          Update Status
        </Typography>
        <FormControl fullWidth>
          <Select value={status} onChange={handleStatusChange}>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppShell>
  );
}
