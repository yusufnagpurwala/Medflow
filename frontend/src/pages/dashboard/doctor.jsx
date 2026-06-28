import React, { useEffect, useState } from 'react';
import { Button, Box, Typography, Tooltip as MuiTooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import EyeIcon from '@mui/icons-material/RemoveRedEye';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import {
  AppShell,
  PageHeader,
  ChartCard,
  DataTable,
  StatusChip,
  EmptyState,
  Loader,
} from '@/components';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
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

const hasData = (arr) => Array.isArray(arr) && arr.length > 0;

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

export default function DoctorDashboard() {
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

  const [appointments, setAppointments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
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

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/appointments/analytics');
        setAnalytics(res.data.data || null);
      } catch (err) {
        // analytics is non-critical; leave charts empty on failure
      }
    };

    if (user?.role === 'doctor') fetchAnalytics();
  }, [user]);

  const columns = [
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
        params.value
          ? new Date(params.value).toLocaleString([], {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'N/A',
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
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <span
          title={params.value || ''}
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {params.value || 'N/A'}
        </span>
      ),
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
      headerName: 'Record',
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <MuiTooltip title="Add or view medical record">
          <Button
            variant="text"
            color="info"
            startIcon={<EyeIcon />}
            size="small"
            aria-label="Add or view medical record"
            onClick={() => router.push(`/records/new?appointmentId=${params.row._id}`)}
          >
            Record
          </Button>
        </MuiTooltip>
      ),
    },
  ];

  // Redirecting (no user post-hydration) — render nothing to avoid a flash
  // of the default "Welcome, Doctor" header before the redirect lands.
  if (!user) return null;

  return (
    <AppShell title="Dashboard">
      <PageHeader
        title={`Welcome, ${user?.name || 'Doctor'}`}
        subtitle="Here are your appointments"
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          mb: 4,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        }}
      >
        <ChartCard
          title="My Appointments by Status"
          subtitle={
            typeof analytics?.total === 'number'
              ? `${analytics.total} total appointments`
              : undefined
          }
        >
          {hasData(analytics?.byStatus) ? (
            <PieChart>
              <Pie
                data={analytics.byStatus}
                dataKey="count"
                nameKey="status"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {analytics.byStatus.map((entry, i) => (
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
          {hasData(analytics?.trend) ? (
            <LineChart data={analytics.trend}>
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
      </Box>

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
