import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { AppShell, PageHeader, Loader, AvailabilityEditor } from '@/components';

export default function AdminDoctorAvailability() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();

  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const name = typeof router.query.name === 'string' ? router.query.name : '';

  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Auth guard: admin only.
  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'admin') {
      router.push(`/dashboard/${user?.role}`);
    }
  }, [isHydrated, user, router]);

  const fetchAvailability = async (doctorId) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/doctors/${doctorId}/availability`);
      setAvailability(res.data.data || null);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to load availability',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    if (user?.role === 'admin' && id) fetchAvailability(id);
  }, [router.isReady, user, id]);

  const save = async (payload) => {
    if (!id) return;
    setSaving(true);
    try {
      const res = await api.put(`/admin/doctors/${id}/availability`, payload);
      setAvailability(res.data.data || payload);
      setSnackbar({ open: true, message: 'Availability saved', severity: 'success' });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save availability',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title="Doctor Availability">
      <PageHeader
        title={`Availability — ${name || 'Doctor'}`}
        subtitle="View, add or edit this doctor's booking slots"
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/admin/doctors')}
          >
            Back to Doctors
          </Button>
        }
      />

      {loading ? (
        <Loader label="Loading availability..." />
      ) : (
        <AvailabilityEditor
          key={JSON.stringify(availability)}
          value={availability}
          onSave={save}
          saving={saving}
        />
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
