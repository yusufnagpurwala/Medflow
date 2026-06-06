import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Stack,
  Autocomplete,
  CircularProgress,
  Alert,
  Box,
  Typography,
  ToggleButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import dayjs from 'dayjs';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AppShell, PageHeader, FormCard, Loader, EmptyState } from '@/components';

export default function CreateAppointment() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const router = useRouter();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slotsData, setSlotsData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auth guard: patient only.
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

  // Fetch slots for the given doctor + date. Clears any prior selection.
  const fetchSlots = async (doctorId, dateObj) => {
    if (!doctorId || !dateObj) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const res = await api.get('/appointments/slots', {
        params: { doctorId, date: dateObj.format('YYYY-MM-DD') },
      });
      setSlotsData(res.data.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load slots');
      setSlotsData(null);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Reset slots + selection whenever doctor or date changes (stale-prevention),
  // then refetch when both are present.
  useEffect(() => {
    setSlotsData(null);
    setSelectedSlot(null);
    if (selectedDoctor?._id && selectedDate) {
      fetchSlots(selectedDoctor._id, selectedDate);
    }
  }, [selectedDoctor, selectedDate]);

  const isValid =
    Boolean(selectedDoctor) && Boolean(selectedSlot) && reason.trim().length > 5;

  const handleSubmit = async () => {
    setError('');
    if (!isValid) {
      setError('Please select a doctor, a slot, and enter a reason.');
      return;
    }
    setSubmitting(true);

    try {
      await api.post('/appointments/create-appointment', {
        doctorId: selectedDoctor._id,
        appointmentDate: selectedSlot.iso,
        reason: reason.trim(),
      });
      localStorage.setItem(
        'snackbar',
        JSON.stringify({ open: true, message: 'Appointment Booked!', severity: 'success' })
      );
      router.push('/dashboard/patient');
    } catch (err) {
      const statusCode = err.response?.status;
      if (statusCode === 409) {
        setError('That slot was just taken — please pick another.');
        setSelectedSlot(null);
        // Refresh the grid so the taken slot shows as unavailable.
        if (selectedDoctor?._id && selectedDate) {
          fetchSlots(selectedDoctor._id, selectedDate);
        }
      } else {
        setError(err.response?.data?.message || 'Failed to create appointment');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.push('/dashboard/patient');
  };

  const renderSlots = () => {
    if (!selectedDoctor || !selectedDate) return null;

    if (loadingSlots) return <Loader label="Loading slots..." />;

    if (!slotsData) return null;

    if (slotsData.hasAvailability === false) {
      return (
        <Alert severity="info">This doctor isn&apos;t accepting bookings yet.</Alert>
      );
    }

    const slots = Array.isArray(slotsData.slots) ? slotsData.slots : [];
    if (slots.length === 0) {
      return (
        <EmptyState
          icon={EventBusyIcon}
          title="No available slots on this day."
          description="Try selecting another date."
        />
      );
    }

    return (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Select a time
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(3, 1fr)',
              sm: 'repeat(4, 1fr)',
              md: 'repeat(5, 1fr)',
            },
            gap: 1,
          }}
        >
          {slots.map((slot) => {
            const selected = selectedSlot?.iso === slot.iso;
            return (
              <ToggleButton
                key={slot.iso}
                value={slot.iso}
                selected={selected}
                disabled={!slot.available}
                onChange={() => setSelectedSlot(slot)}
                size="small"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                {slot.time}
              </ToggleButton>
            );
          })}
        </Box>
      </Box>
    );
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
        subtitle="Pick a doctor, choose a date, then select an open slot"
        maxWidth={620}
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
            <DatePicker
              label="Appointment Date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              disablePast
              minDate={dayjs()}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>

          {renderSlots()}

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
    </AppShell>
  );
}
