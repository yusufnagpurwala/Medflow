import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import EyeIcon from '@mui/icons-material/RemoveRedEye';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import {
  AppShell,
  PageHeader,
  StatusChip,
  EmptyState,
  Loader,
} from '@/components';

export default function PatientDashboard() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'patient') {
      router.push(`/dashboard/${user?.role}`);
    }
  }, [isHydrated, user, router]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments');
        setAppointments(res.data.data || []);
      } catch (err) {
        // swallow fetch error; UI falls back to empty state
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchAppointments();
  }, [user]);

  useEffect(() => {
    const savedSnackbar = localStorage.getItem('snackbar');
    if (savedSnackbar) {
      const parsedSnackbar = JSON.parse(savedSnackbar);
      setSnackbar(parsedSnackbar);
      localStorage.removeItem('snackbar'); // Clear snackbar state after displaying
    }
  }, []);

  // Redirecting (no user post-hydration) — render nothing to avoid a flash
  // of the default "Welcome, Patient" header before the redirect lands.
  if (!user) return null;

  return (
    <AppShell title="Dashboard">
      <PageHeader
        title={`Welcome, ${user?.name || 'Patient'}`}
        subtitle="Your appointments"
        action={
          <Button
            variant="contained"
            onClick={() => router.push('/appointment/create-appointment')}
          >
            Book Appointment
          </Button>
        }
      />

      {loading ? (
        <Loader />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={EventBusyIcon}
          title="No appointments yet"
          description="Book your first appointment to get started."
          action={
            <Button
              variant="contained"
              onClick={() => router.push('/appointment/create-appointment')}
            >
              Book Appointment
            </Button>
          }
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          }}
        >
          {[...appointments]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((appointment) => {
            const cancelled = appointment.status === 'cancelled';
            return (
              <Card
                key={appointment._id}
                variant="outlined"
                sx={{ opacity: cancelled ? 0.6 : 1 }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                    sx={{ mb: 1.5 }}
                  >
                    <Typography variant="h6" sx={{ color: 'text.primary' }}>
                      {appointment.doctorId?.name || 'N/A'}
                    </Typography>
                    <StatusChip status={appointment.status} />
                  </Stack>

                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Date:</strong>{' '}
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Time:</strong>{' '}
                      {new Date(appointment.appointmentDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Reason:</strong> {appointment.reason || 'N/A'}
                    </Typography>
                  </Stack>

                  {appointment.status === 'completed' && (
                    <Button
                      variant="outlined"
                      startIcon={<EyeIcon />}
                      color="primary"
                      sx={{ mt: 2 }}
                      onClick={() => {
                        router.push(`/records/${appointment._id}`);
                      }}
                    >
                      View Record
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppShell>
  );
}
