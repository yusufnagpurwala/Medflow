import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Stack,
  Autocomplete,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import dayjs from 'dayjs';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AppShell, PageHeader, FormCard } from '@/components';

export default function CreateAppointment() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const router = useRouter();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [reason, setReason] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
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
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const res = await api.get('/users/doctors');
        setDoctors(res.data.data || []);
      } catch (err) {
        // swallow fetch error; doctor list falls back to empty
      } finally {
        setLoadingDoctors(false);
      }
    };

    if (user) fetchDoctors();
  }, [user]);

  const isValid =
    selectedDoctor &&
    appointmentDate &&
    dayjs(appointmentDate).isAfter(dayjs()) &&
    reason.trim().length > 5;

  const handleSubmit = async () => {
    setError('');
    if (!isValid) {
      setError('Please fill all fields correctly.');
      return;
    }
    setSubmitting(true);

    try {
      await api.post('/appointments/create-appointment', {
        doctorId: selectedDoctor?._id,
        appointmentDate: appointmentDate.toISOString(),
        reason: reason.trim(),
      });
      localStorage.setItem(
        'snackbar',
        JSON.stringify({ open: true, message: 'Appointment Booked!', severity: 'success' })
      );
      router.push('/dashboard/patient');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.push('/dashboard/patient');
  };

  return (
    <AppShell title="Book Appointment">
      <PageHeader
        title="Book Appointment"
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
          >
            Back to Dashboard
          </Button>
        }
      />

      <FormCard
        title="Book an Appointment"
        subtitle="Schedule a visit with a doctor"
        maxWidth={560}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          <Autocomplete
            options={doctors}
            loading={loadingDoctors}
            getOptionLabel={(option) =>
              `${option.name}${option.specialization ? ` — ${option.specialization}` : ' (General)'}`
            }
            value={selectedDoctor}
            onChange={(event, newValue) => setSelectedDoctor(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Doctor"
                placeholder="Select a doctor"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingDoctors ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Appointment Date & Time"
              value={appointmentDate}
              onChange={(newValue) => setAppointmentDate(newValue)}
              disablePast
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>

          <TextField
            label="Reason for visit"
            placeholder="Describe your symptoms or reason"
            multiline
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={reason.length > 0 && reason.length < 5}
            helperText="Minimum 5 characters"
            fullWidth
          />

          <Button
            variant="contained"
            size="large"
            disabled={!isValid || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Booking...' : 'Book Appointment'}
          </Button>
        </Stack>
      </FormCard>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppShell>
  );
}
