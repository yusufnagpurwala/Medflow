import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
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

const FILTERS = ['all', 'pending', 'approved', 'rejected'];

export default function AdminDoctors() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actioningId, setActioningId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

  // Default filter from query (?status=pending|approved|rejected).
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query.status;
    if (typeof q === 'string' && FILTERS.includes(q) && q !== 'all') {
      setFilter(q);
    }
  }, [router.isReady, router.query.status]);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/admin/doctors');
      setDoctors(res.data.data || []);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to load doctors',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchDoctors();
  }, [user]);

  const handleAction = async (id, action) => {
    if (actioningId) return;
    setActioningId(id);
    try {
      await api.patch(`/admin/doctors/${id}/${action}`);
      const nextStatus = action === 'approve' ? 'approved' : 'rejected';
      setDoctors((prev) =>
        prev.map((d) => (d._id === id ? { ...d, status: nextStatus } : d))
      );
      setSnackbar({
        open: true,
        message: action === 'approve' ? 'Doctor approved' : 'Doctor rejected',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || `Failed to ${action} doctor`,
        severity: 'error',
      });
    } finally {
      setActioningId(null);
    }
  };

  const filteredRows = useMemo(() => {
    if (filter === 'all') return doctors;
    return doctors.filter((d) => d.status === filter);
  }, [doctors, filter]);

  const columns = [
    { field: 'name', headerName: 'Name', width: 160 },
    { field: 'email', headerName: 'Email', width: 220 },
    {
      field: 'specialization',
      headerName: 'Specialization',
      width: 160,
      renderCell: (params) => params.value || 'N/A',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => <StatusChip status={params.row.status} />,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 300,
      sortable: false,
      renderCell: (params) => {
        const { _id, status, name } = params.row;
        const busy = actioningId === _id;
        return (
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              color="success"
              size="small"
              disabled={busy || status === 'approved'}
              onClick={() => handleAction(_id, 'approve')}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              disabled={busy || status === 'rejected'}
              onClick={() => handleAction(_id, 'reject')}
            >
              Reject
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                router.push(
                  `/admin/doctors/${_id}/availability?name=${encodeURIComponent(name)}`
                )
              }
            >
              Slots
            </Button>
          </Box>
        );
      },
    },
  ];

  return (
    <AppShell title="Doctors">
      <PageHeader title="Doctors" subtitle="Manage all doctors" />

      {loading ? (
        <Loader />
      ) : doctors.length === 0 ? (
        <EmptyState icon={MedicalServicesIcon} title="No doctors yet" />
      ) : (
        <>
          <ToggleButtonGroup
            value={filter}
            exclusive
            size="small"
            onChange={(e, val) => {
              if (val) setFilter(val);
            }}
            sx={{ mb: 3 }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="pending">Pending</ToggleButton>
            <ToggleButton value="approved">Approved</ToggleButton>
            <ToggleButton value="rejected">Rejected</ToggleButton>
          </ToggleButtonGroup>

          {/* Box wrapper for rejected-row opacity: DataTable owns its internal
              sx and forwards ...rest AFTER it, so passing sx via rest would
              override (not merge) the grid styling. Wrapping preserves it. */}
          <Box sx={{ '& .row-rejected': { opacity: 0.5 } }}>
            <DataTable
              rows={filteredRows}
              columns={columns}
              getRowClassName={(p) => (p.row.status === 'rejected' ? 'row-rejected' : '')}
            />
          </Box>
        </>
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
