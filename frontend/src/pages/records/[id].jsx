import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Button,
  Stack,
} from '@mui/material';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotesIcon from '@mui/icons-material/Notes';
import MedicationIcon from '@mui/icons-material/Medication';
import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';

export default function ViewMedicalRecord() {
  const router = useRouter();
  const { id } = router.query;

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await api.get(`/records/${id}`);
        console.log('Fetched Record: ', res.data.data);
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

  if (loading) {
    return (
      <Container sx={{ mt: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!record) {
    return (
      <Container sx={{ mt: 6 }}>
        <Alert severity="info">Record not created yet by the doctor.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/dashboard/patient')}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>

      <Paper elevation={3} sx={{ p: 4, backgroundColor: '#f9f9f9' }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <AssignmentIcon color="primary" /> Medical Record
        </Typography>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
           Doctor: {record.doctorId.name}
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotesIcon color="secondary" />
            <Typography variant="body1">
              <strong>Diagnosis:</strong> {record.diagnosis}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotesIcon color="secondary" />
            <Typography variant="body1">
              <strong>Notes:</strong> {record.notes}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MedicationIcon color="success" />
            <Typography variant="body1">
              <strong>Prescription:</strong> {record.prescription}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FollowTheSignsIcon color="info" />
            <Typography variant="body1">
              <strong>Follow-up Instructions:</strong> {record.followUp}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}