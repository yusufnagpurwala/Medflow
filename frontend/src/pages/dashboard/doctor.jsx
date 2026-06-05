import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import EyeIcon from '@mui/icons-material/RemoveRedEye';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import {
  AppShell,
  PageHeader,
  DataTable,
  StatusChip,
  EmptyState,
  Loader,
} from '@/components';

export default function DoctorDashboard() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'doctor') {
      router.push('/login');
    }
  }, [isHydrated, router, user]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments');
        setAppointments(res.data.data || []);
      } catch (err) {
        // swallow fetch error; UI falls back to empty state
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchAppointments();
  }, [user]);

  const columns = [
    { field: '_id', headerName: 'ID' },
    {
      field: 'patientId',
      headerName: 'Patient',
      width: 180,
      renderCell: (params) => params.value?.name || 'N/A',
    },
    {
      field: 'appointmentDate',
      headerName: 'Date',
      width: 180,
      renderCell: (params) =>
        params.value ? new Date(params.value).toLocaleString() : 'N/A',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    {
      field: 'reason',
      headerName: 'Reason',
      width: 150,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => {
        const handleViewAppointment = () => {
          router.push(`/appointment/${params.row._id}`);
        };

        return (
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={handleViewAppointment}
          >
            View
          </Button>
        );
      },
    },
    {
      field: 'records',
      headerName: 'Records',
      width: 100,
      renderCell: (params) => {
        const handleViewRecords = () => {
          router.push(`/records/new?appointmentId=${params.row._id}`);
        };

        return (
          <Button
            variant="text"
            color="info"
            startIcon={<EyeIcon />}
            size="small"
            onClick={handleViewRecords}
          />
        );
      },
    },
  ];

  return (
    <AppShell title="Dashboard">
      <PageHeader
        title={`Welcome, ${user?.name || 'Doctor'}`}
        subtitle="Here are your appointments"
      />

      {loading ? (
        <Loader label="Loading appointments" />
      ) : appointments.length === 0 ? (
        <EmptyState icon={EventBusyIcon} title="No appointments yet" />
      ) : (
        <DataTable rows={appointments} columns={columns} />
      )}
    </AppShell>
  );
}
