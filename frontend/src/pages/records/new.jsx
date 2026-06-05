import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Divider,
} from '@mui/material';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlockIcon from '@mui/icons-material/Block';
import { AppShell, PageHeader, FormCard, EmptyState, Loader } from '@/components';

export default function CreateMedicalRecord() {
  const router = useRouter();
  const { appointmentId } = router.query;

  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  // appointment context
  const [appointment, setAppointment] = useState(null);
  const [loadingAppointment, setLoadingAppointment] = useState(true);

  // form state
  const [recordId, setRecordId] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [followUp, setFollowUp] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [show, setShow] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isUpdate, setIsUpdate] = useState(false); // Boolean state for button

  useEffect(() => {
    if (!router.isReady || !isHydrated) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'doctor') {
      router.push(`/dashboard/${user?.role}`);
      return;
    }

    if (!appointmentId) {
      router.push('/dashboard/doctor');
      return;
    }

    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/appointments/${appointmentId}`);
        const appt = res.data.data;
        // frontend safety checks
        if (appt.status !== 'completed') {
          setError('Medical records can only be created for completed appointments.');
          setShow(false);
          return;
        }

        if (appt.doctorId._id !== user._id) {
          setShow(false);
          setError('You are not authorized to create a record for this appointment.');
          return;
        }

        setAppointment(appt);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load appointment'
        );
        setShow(false);
      } finally {
        setLoadingAppointment(false);
      }
    };

    fetchAppointment();

    const findAppointment = async () => {
      try {
        const res = await api.get(`/records/${appointmentId}`);
        if (res.data) {
            setRecordId(res.data.data._id);
            setDiagnosis(res.data.data.diagnosis || '');
            setNotes(res.data.data.notes || '');
            setPrescription(res.data.data.prescription || '');
            setFollowUp(res.data.data.followUp || '');
            setMessage('Medical record for this appointment already exists.');
            setIsUpdate(true); // Set to true if record exists
            // setShow(false);
            return;
        }
      } catch (err) {
        setError(null);
      }
    }
    findAppointment();
  }, [router.isReady, isHydrated, appointmentId, user, router]);


  const isFormValid = diagnosis.trim().length >= 5;


  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      if (!isUpdate) {
        await api.post('/records/create-record', {
          appointmentId: appointmentId,
          patientId: appointment.patientId._id,
          diagnosis: diagnosis.trim(),
          prescription: prescription.trim(),
          notes: notes.trim(),
          followUp: followUp.trim(),
        });
      } else {
        await api.patch(`/records/${recordId}`, {
          diagnosis: diagnosis.trim(),
          prescription: prescription.trim(),
          notes: notes.trim(),
          followUp: followUp.trim(),
        });
      }

      router.push('/dashboard/doctor');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save medical record'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const backAction = (
    <Button
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      onClick={() => {
        router.push(`/dashboard/${user?.role}`);
      }}
    >
      Back to Dashboard
    </Button>
  );

  if (loadingAppointment) {
    return (
      <AppShell title="Medical Record">
        <Loader label="Loading appointment..." />
      </AppShell>
    );
  }

  if (!show) {
    return (
      <AppShell title="Medical Record">
        <PageHeader
          title="Create Medical Record"
          subtitle="Record details for a completed appointment"
          action={backAction}
        />
        <EmptyState
          icon={BlockIcon}
          title="Cannot create record"
          description={error || 'An unexpected error occurred.'}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Medical Record">
      <PageHeader
        title="Create Medical Record"
        subtitle="Record details for a completed appointment"
        action={backAction}
      />

      <FormCard maxWidth={720}>
        <Alert severity="info" sx={{ mb: 3 }}>
          {message || 'Please fill out the form below to create a new medical record.'}
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Appointment summary */}
        {appointment && (
          <Card
            variant="outlined"
            sx={{ p: 2.5, mb: 3, bgcolor: 'background.default' }}
          >
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1.5 }}>
              Appointment Summary
            </Typography>
            <Stack spacing={0.75}>
              <Typography variant="body2">
                <strong>Patient:</strong> {appointment.patientId.name}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong>{' '}
                {new Date(appointment.appointmentDate).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                <strong>Reason:</strong> {appointment.reason}
              </Typography>
            </Stack>
          </Card>
        )}

        {appointment && <Divider sx={{ mb: 3 }} />}

        {/* Medical record form */}
        <Stack spacing={3}>
          <TextField
            label="Diagnosis"
            placeholder="Enter diagnosis"
            multiline
            rows={3}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            error={diagnosis.length > 0 && diagnosis.length < 5}
            helperText="Minimum 5 characters"
            required
            fullWidth
          />

          <TextField
            label="Treatment / Notes"
            placeholder="Additional notes or treatment details"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
          />

          <TextField
            label="Prescription"
            placeholder="Medication and dosage"
            multiline
            rows={2}
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            fullWidth
          />

          <TextField
            label="Follow-up Instructions"
            placeholder="Follow-up advice for the patient"
            multiline
            rows={2}
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            fullWidth
          />

          <Button
            variant="contained"
            size="large"
            disabled={!isFormValid || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Saving Record...' : isUpdate ? 'Update Medical Record' : 'Create Medical Record'}
          </Button>
        </Stack>
      </FormCard>
    </AppShell>
  );
}
