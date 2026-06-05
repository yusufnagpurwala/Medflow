import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import LogoutIcon from '@mui/icons-material/Logout';
import EyeIcon from '@mui/icons-material/RemoveRedEye';

export default function PatientDashboard() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!isHydrated) return;

    if (!token) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'patient') {
      router.push(`/dashboard/${user?.role}`);
    }
  }, [isHydrated, token, user, router]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments');
        setAppointments(res.data.data || []);
      } catch (err) {
        console.log('Error Fetching Data: ', err);
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

  return (
    <Container>
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box display="flex" alignItems="center">
            <Avatar sx={{ width: 56, height: 56, marginRight: 2 }}>
              {user?.name?.charAt(0) || 'P'}
            </Avatar>
            <Box>
              <Typography variant="h5">Welcome, {user?.name || 'Patient'}</Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Here are your upcoming appointments
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={() => {
              useAuthStore.getState().logout();
              router.push('/login');
            }}
          >
            Logout
          </Button>
        </Box>

        <Box display="flex" justifyContent="flex-end" marginBottom={2}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => router.push('/appointment/create-appointment')}
          >
            Book Appointment
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Your Appointments
              </Typography>
              {appointments.length === 0 ? (
                <Typography>No appointments found.</Typography>
              ) : (
                appointments.map((appointment) => (
                  <Box
                    key={appointment._id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 2,
                      marginBottom: 2,
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      backgroundColor: appointment.status === 'cancelled' ? '#f0f0f0' : '#f9f9f9',
                      opacity: appointment.status === 'cancelled' ? 0.6 : 1,
                    }}
                  >
                    <Box>
                      <Typography variant="body1">
                        <strong>Doctor:</strong> {appointment.doctorId?.name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Date:</strong>{' '}
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Time:</strong>{' '}
                        {new Date(appointment.appointmentDate).toLocaleTimeString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Reason:</strong> {appointment.reason || 'N/A'}
                      </Typography>
                    </Box>
                    <Chip
                      label={appointment.status}
                      size="small"
                      color={
                        appointment.status === 'completed'
                          ? 'success'
                          : appointment.status === 'pending'
                          ? 'warning'
                          : appointment.status === 'confirmed'
                          ? 'info'
                          : 'error'
                      }
                      variant="outlined"
                    />
                    {appointment.status === 'completed' && (
                      <Button
                        variant="outlined"
                        startIcon={<EyeIcon />}
                        color="primary"
                        sx={{ marginTop: 2, borderRadius: '16px' }}
                        onClick={async () => {
                          router.push(`/records/${appointment._id}`);
                        }}
                      >
                        View Record
                      </Button>
                    )}
                  </Box>
                )))
              }
            </CardContent>
          </Card>
        )}
      </Paper>
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
    </Container>
  );
}