import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { AppShell, PageHeader, Loader, AvailabilityEditor } from '@/components';

export default function MyAvailability() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();

  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Auth guard: doctor only.
  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'doctor') {
      router.push(`/dashboard/${user?.role}`);
    }
  }, [isHydrated, user, router]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res = await api.get('/availability/me');
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
    if (user?.role === 'doctor') fetchAvailability();
  }, [user]);

  const save = async (payload) => {
    setSaving(true);
    try {
      const res = await api.put('/availability/me', payload);
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
    <AppShell title="Availability">
      <PageHeader
        title="My Availability"
        subtitle="Set the days and times you're available for appointments"
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
