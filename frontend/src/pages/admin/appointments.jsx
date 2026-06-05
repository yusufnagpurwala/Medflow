import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Snackbar, Alert } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import {
  AppShell,
  PageHeader,
  DataTable,
  StatusChip,
  EmptyState,
  Loader,
} from '@/components';

export default function AdminAppointments() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
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
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/admin/appointments');
        setAppointments(res.data.data || []);
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.response?.data?.message || 'Failed to load appointments',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user]);

  const columns = [
    {
      field: 'doctor',
      headerName: 'Doctor',
      width: 160,
      sortable: false,
      renderCell: (params) => params.row.doctorId?.name || 'N/A',
    },
    {
      field: 'patient',
      headerName: 'Patient',
      width: 160,
      sortable: false,
      renderCell: (params) => params.row.patientId?.name || 'N/A',
    },
    {
      field: 'appointmentDate',
      headerName: 'Date',
      width: 200,
      renderCell: (params) =>
        params.value ? new Date(params.value).toLocaleString() : 'N/A',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => <StatusChip status={params.row.status} />,
    },
    { field: 'reason', headerName: 'Reason', width: 240 },
  ];

  return (
    <AppShell title="Appointments">
      <PageHeader title="Appointments" subtitle="All appointments" />

      {loading ? (
        <Loader />
      ) : appointments.length === 0 ? (
        <EmptyState icon={EventIcon} title="No appointments yet" />
      ) : (
        <DataTable rows={appointments} columns={columns} />
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
