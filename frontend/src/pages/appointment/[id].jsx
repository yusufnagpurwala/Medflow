import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Button,
  Divider,
  Avatar,
} from '@mui/material';
import { useRouter } from 'next/router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { TimeIcon } from '@mui/x-date-pickers';

export default function AppointmentDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  useEffect(() => {
      if (!useAuthStore.getState().isHydrated) return;
  
      if (!token) {
        router.push('/login');
        return;
      }
  
      if (user?.role !== 'doctor') {
        router.push('/login');
      }
    });
    
  useEffect(() => {
    if (!id) return;

    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/appointments/${id}`);
        setAppointment(res.data.data);
        setStatus(res.data.data.status);
      } catch (err) {
        console.error('Error fetching appointment:', err);
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
      console.error('Error updating status:', err);
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!appointment) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6">Appointment not found</Typography>
      </Box>
    );
  }

  return (
    <Container>
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4, borderRadius: 2, backgroundColor: '#f0f4f8' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard/doctor')}
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Appointment Details
          </Typography>
        </Box>
        <Divider sx={{ marginBottom: 3 }} />
        <Box mb={3}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: '#1976d2', marginRight: 2 }}>
              <MedicalServicesIcon />
            </Avatar>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', color: '#333' }}>
              <strong>Doctor:</strong> {appointment.doctorId?.name || 'N/A'}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: '#388e3c', marginRight: 2 }}>
              <PersonIcon />
            </Avatar>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', color: '#333' }}>
              <strong>Patient Name:</strong> {appointment.patientId?.name || 'N/A'}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: '#f57c00', marginRight: 2 }}>
              <EventIcon />
            </Avatar>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', color: '#333' }}>
              <strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: '#b20bcfff', marginRight: 2 }}>
              <TimeIcon />
            </Avatar>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', color: '#333' }}>
              <strong>Time:</strong> {new Date(appointment.appointmentDate).toLocaleTimeString()}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: '#d32f2f', marginRight: 2 }}>
              <MedicalServicesIcon />
            </Avatar>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', color: '#333' }}>
              <strong>Reason:</strong> {appointment.reason || 'N/A'}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1" mb={2} sx={{ fontSize: '1.1rem', color: '#333' }}>
            <strong>Update Status: </strong>
        </Typography>
        <FormControl fullWidth>
          <Select
            labelId="status-label"
            value={status}
            onChange={handleStatusChange}
            sx={{ backgroundColor: '#fff', borderRadius: 1 }}
          >
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </Paper>
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
    </Container>
  );
}