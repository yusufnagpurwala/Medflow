import React, { useEffect, useState } from 'react';
import { Box, Button, Snackbar, Alert, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import PeopleIcon from '@mui/icons-material/People';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  AppShell,
  PageHeader,
  StatCard,
  ChartCard,
  DataTable,
  EmptyState,
  Loader,
} from '@/components';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// Theme-aligned colors (match StatusChip + Teal/Slate theme)
const STATUS_COLORS = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  completed: '#22C55E',
  cancelled: '#EF4444',
  approved: '#22C55E',
  rejected: '#EF4444',
};
const PALETTE = ['#0D9488', '#10B981', '#3B82F6', '#F59E0B', '#22C55E', '#EF4444'];

const colorFor = (key, i) => STATUS_COLORS[key] || PALETTE[i % PALETTE.length];

const NoData = () => (
  <Box
    sx={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'text.secondary',
    }}
  >
    <Typography variant="body2">No data yet</Typography>
  </Box>
);

const hasData = (arr) => Array.isArray(arr) && arr.length > 0;

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();
  const theme = useTheme();

  // Chart colors derived from the live theme so they adapt to dark mode.
  const gridColor = theme.palette.divider;
  const axisColor = theme.palette.text.secondary;
  const axisTick = { fill: axisColor, fontSize: 11 };
  const legendStyle = { fontSize: 12, color: axisColor };
  const tooltipStyle = {
    fontSize: 12,
    borderRadius: 8,
    border: `1px solid ${gridColor}`,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  };

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
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
  }, [isHydrated, router, user]);

  const fetchData = async () => {
    // allSettled so one failing endpoint (e.g. non-critical analytics) can't
    // wipe the others — each piece of state is set from its own result.
    const [statsRes, pendingRes, analyticsRes] = await Promise.allSettled([
      api.get('/admin/stats'),
      api.get('/admin/doctors/pending'),
      api.get('/admin/analytics'),
    ]);

    if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data || null);
    if (pendingRes.status === 'fulfilled') setPending(pendingRes.value.data.data || []);
    if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data.data || null);

    // Surface an error only if a CORE endpoint (stats/pending) failed.
    if (statsRes.status === 'rejected' || pendingRes.status === 'rejected') {
      const err = statsRes.reason || pendingRes.reason;
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to load admin data',
        severity: 'error',
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user]);

  const handleAction = async (id, action) => {
    if (actioningId) return; // block overlapping mutations
    setActioningId(id);
    try {
      await api.patch(`/admin/doctors/${id}/${action}`);
      // optimistic: drop the row immediately so it can't be acted on twice
      setPending((prev) => prev.filter((d) => d._id !== id));
      setSnackbar({
        open: true,
        message: action === 'approve' ? 'Doctor approved' : 'Doctor rejected',
        severity: 'success',
      });
      fetchData(); // re-sync stats + pending from server
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

  const statCards = [
    {
      label: 'Patients',
      value: stats?.patients ?? 0,
      icon: PeopleIcon,
      color: 'primary',
      onClick: () => router.push('/admin/patients'),
    },
    {
      label: 'Doctors',
      value: stats?.doctors ?? 0,
      icon: MedicalServicesIcon,
      color: 'primary',
      onClick: () => router.push('/admin/doctors'),
    },
    {
      label: 'Pending Doctors',
      value: stats?.pendingDoctors ?? 0,
      icon: HourglassEmptyIcon,
      color: 'warning',
      onClick: () => router.push('/admin/doctors?status=pending'),
    },
    {
      label: 'Appointments',
      value: stats?.appointments ?? 0,
      icon: EventIcon,
      color: 'primary',
      onClick: () => router.push('/admin/appointments'),
    },
  ];

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
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="success"
            size="small"
            disabled={actioningId === params.row._id}
            onClick={() => handleAction(params.row._id, 'approve')}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            disabled={actioningId === params.row._id}
            onClick={() => handleAction(params.row._id, 'reject')}
          >
            Reject
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <AppShell title="Admin">
      <PageHeader
        title={`Welcome, ${user?.name || 'Admin'}`}
        subtitle="Admin control panel"
      />

      {loading ? (
        <Loader />
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              mb: 4,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
            }}
          >
            {statCards.map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
                color={card.color}
                onClick={card.onClick}
              />
            ))}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              mb: 4,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            }}
          >
            <ChartCard title="Appointments by Status">
              {hasData(analytics?.appointmentsByStatus) ? (
                <PieChart>
                  <Pie
                    data={analytics.appointmentsByStatus}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {analytics.appointmentsByStatus.map((entry, i) => (
                      <Cell key={entry.status} fill={colorFor(entry.status, i)} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={legendStyle} />
                </PieChart>
              ) : (
                <NoData />
              )}
            </ChartCard>

            <ChartCard title="Bookings (last 30 days)">
              {hasData(analytics?.appointmentsTrend) ? (
                <LineChart data={analytics.appointmentsTrend}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={axisTick} stroke={gridColor} />
                  <YAxis allowDecimals={false} tick={axisTick} stroke={gridColor} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0D9488"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              ) : (
                <NoData />
              )}
            </ChartCard>

            <ChartCard title="Doctors by Status">
              {hasData(analytics?.doctorsByStatus) ? (
                <BarChart data={analytics.doctorsByStatus}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                  <XAxis dataKey="status" tick={axisTick} stroke={gridColor} />
                  <YAxis allowDecimals={false} tick={axisTick} stroke={gridColor} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(13,148,136,0.06)' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analytics.doctorsByStatus.map((entry, i) => (
                      <Cell key={entry.status} fill={colorFor(entry.status, i)} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <NoData />
              )}
            </ChartCard>

            <ChartCard title="Users">
              {hasData(analytics?.usersBreakdown) ? (
                <PieChart>
                  <Pie
                    data={analytics.usersBreakdown}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {analytics.usersBreakdown.map((entry, i) => (
                      <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={legendStyle} />
                </PieChart>
              ) : (
                <NoData />
              )}
            </ChartCard>
          </Box>

          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
            Pending Doctor Approvals
          </Typography>

          {pending.length === 0 ? (
            <EmptyState
              icon={CheckCircleIcon}
              title="All caught up"
              description="No pending doctor requests."
            />
          ) : (
            <DataTable rows={pending} columns={columns} />
          )}
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
