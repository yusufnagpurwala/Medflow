import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Snackbar, Alert } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import {
  AppShell,
  PageHeader,
  DataTable,
  EmptyState,
  Loader,
} from '@/components';

export default function AdminPatients() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isHydrated, user, router]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    const fetchPatients = async () => {
      try {
        const res = await api.get('/admin/patients');
        setPatients(res.data.data || []);
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.response?.data?.message || 'Failed to load patients',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [user]);

  const columns = [
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'email', headerName: 'Email', width: 240 },
    { field: 'age', headerName: 'Age', width: 100 },
    {
      field: 'createdAt',
      headerName: 'Joined',
      width: 160,
      renderCell: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : 'N/A',
    },
  ];

  return (
    <AppShell title="Patients">
      <PageHeader title="Patients" subtitle="All registered patients" />

      {loading ? (
        <Loader />
      ) : patients.length === 0 ? (
        <EmptyState icon={PeopleIcon} title="No patients yet" />
      ) : (
        <DataTable rows={patients} columns={columns} />
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
