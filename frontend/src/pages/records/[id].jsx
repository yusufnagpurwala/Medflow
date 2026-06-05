import React, { useEffect, useState } from 'react';
import {
  Card,
  Box,
  Typography,
  Divider,
  Button,
  Stack,
} from '@mui/material';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotesIcon from '@mui/icons-material/Notes';
import MedicationIcon from '@mui/icons-material/Medication';
import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { AppShell, PageHeader, EmptyState, Loader } from '@/components';

function RecordSection({ icon: Icon, label, value }) {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
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
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.primary' }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function ViewMedicalRecord() {
  const router = useRouter();
  const { id } = router.query;

  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.push('/login');
    }
  }, [isHydrated, user, router]);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await api.get(`/records/${id}`);
        setRecord(res.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to fetch the medical record.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRecord();
  }, [id]);

  const backAction = (
    <Button
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      onClick={() => router.push('/dashboard/patient')}
    >
      Back to Dashboard
    </Button>
  );

  if (loading) {
    return (
      <AppShell title="Medical Record">
        <Loader label="Loading record..." />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Medical Record">
        <PageHeader title="Medical Record" action={backAction} />
        <EmptyState
          icon={ErrorOutlineIcon}
          title="Unable to load record"
          description={error}
        />
      </AppShell>
    );
  }

  if (!record) {
    return (
      <AppShell title="Medical Record">
        <PageHeader title="Medical Record" action={backAction} />
        <EmptyState
          icon={AssignmentIcon}
          title="Record not available"
          description="The record has not been created yet."
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Medical Record">
      <PageHeader title="Medical Record" action={backAction} />

      <Card sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <AssignmentIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h5" sx={{ color: 'text.primary' }}>
            Medical Record
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <LocalHospitalIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Doctor: {record.doctorId.name}
          </Typography>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Stack spacing={3}>
          <RecordSection
            icon={NotesIcon}
            label="Diagnosis"
            value={record.diagnosis}
          />
          <RecordSection
            icon={NotesIcon}
            label="Notes"
            value={record.notes}
          />
          <RecordSection
            icon={MedicationIcon}
            label="Prescription"
            value={record.prescription}
          />
          <RecordSection
            icon={FollowTheSignsIcon}
            label="Follow-up Instructions"
            value={record.followUp}
          />
        </Stack>
      </Card>
    </AppShell>
  );
}
