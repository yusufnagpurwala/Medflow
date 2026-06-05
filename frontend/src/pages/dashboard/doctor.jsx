import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
} from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { DataGrid } from '@mui/x-data-grid';
import LogoutIcon from '@mui/icons-material/Logout';
import EyeIcon from '@mui/icons-material/RemoveRedEye';

export default function DoctorDashboard() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!useAuthStore.getState().isHydrated) return;

    if (!token) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'doctor') {
      router.push('/login');
    }
  }, [router, user, token]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments');
        console.log('API Response:', res.data); // Log the API response to verify structure
        setAppointments(res.data.data || []);
      } catch (err) {
        console.log('Error Fetching Data: ', err);
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
      renderCell: (params) => (
        <Chip
          label={params.value}
          size='small'
          color={
            params.value === 'completed'
              ? 'success'
              : params.value === 'pending'
              ? 'warning'
              : params.value === 'confirmed'
              ? 'info'
              : 'error'
          }
          variant="outlined"
        />
      ),
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
            sx={{ borderRadius: '16px' }}
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
            sx={{ borderRadius: '16px' }}
            color="info"
            startIcon={<EyeIcon />}
            size="small"
            onClick={handleViewRecords}
          >
            
          </Button>
        );
      },
    },
  ];

  return (
    <Container>
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box display="flex" alignItems="center">
            <Avatar sx={{ width: 56, height: 56, marginRight: 2 }}>
              {user?.name?.charAt(0) || 'D'}
            </Avatar>
            <Box>
              <Typography variant="h5">
                Welcome, {user?.name || 'Doctor'}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Here are your upcoming appointments
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="error"
            size='small'
            sx={{ borderRadius: '16px', padding: '6px 16px' }}
            startIcon={<LogoutIcon />}
            onClick={() => {
              useAuthStore.getState().logout();
              router.push('/login');
            }}
          >
            Logout
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            <CardContent>
              <Box sx={{ height: 500, width: '100%' }}>
                <DataGrid
                  rows={appointments}
                  columns={columns}
                  getRowId={(row) => row._id}
                  pageSize={7}
                  rowsPerPageOptions={[7, 15]}
                  sx={{
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                    '& .MuiDataGrid-row': {
                      '&.cancelled': {
                        backgroundColor: '#f0f0f0',
                        opacity: 0.6,
                      },
                    },
                  }}
                  getRowClassName={(params) =>
                    params.row.status === 'cancelled' ? 'cancelled' : ''
                  }
                />
              </Box>
            </CardContent>
          </Card>
        )}
      </Paper>
    </Container>
  );
}
