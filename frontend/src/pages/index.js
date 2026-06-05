import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AssignmentIcon from '@mui/icons-material/Assignment';

const FEATURES = [
  {
    icon: EventAvailableIcon,
    title: 'Easy Booking',
    description: 'Schedule and manage appointments in just a few clicks.',
  },
  {
    icon: MedicalServicesIcon,
    title: 'Doctor Management',
    description: 'Find the right specialists and keep care coordinated.',
  },
  {
    icon: AssignmentIcon,
    title: 'Medical Records',
    description: 'All your health history, organized and in one place.',
  },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      // Redirect to patient dashboard if logged in
      router.push(`/dashboard/${user?.role}`);
    }
  }, [user, router]);

  if (user) {
    // Prevent rendering the page while redirecting
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background:
          'linear-gradient(180deg, #F8FAFC 0%, rgba(13,148,136,0.07) 100%)',
        py: { xs: 6, md: 8 },
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={{ xs: 5, md: 7 }} alignItems="center" textAlign="center">
          {/* Brand lockup */}
          <Stack direction="row" spacing={1.25} alignItems="center">
            <LocalHospitalIcon sx={{ color: 'primary.main', fontSize: 40 }} />
            <Typography
              variant="h4"
              component="span"
              sx={{ color: 'primary.main', fontWeight: 700 }}
            >
              MedFlow
            </Typography>
          </Stack>

          {/* Hero */}
          <Stack spacing={2.5} alignItems="center" sx={{ maxWidth: 720 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                color: 'text.primary',
                fontSize: { xs: '2.25rem', md: '3rem' },
              }}
            >
              Healthcare management, simplified.
            </Typography>
            <Typography
              variant="h6"
              component="p"
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                maxWidth: 560,
              }}
            >
              Manage appointments, doctors, and medical records in one secure,
              modern place — built for patients and care teams alike.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1 }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => router.push('/login')}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => router.push('/signup')}
              >
                Create account
              </Button>
            </Stack>
          </Stack>

          {/* Feature highlights */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2.5}
            sx={{ width: '100%', pt: { xs: 1, md: 2 } }}
          >
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Box
                key={title}
                sx={{
                  flex: 1,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'left',
                  boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(13,148,136,0.1)',
                    color: 'primary.main',
                    mb: 1.5,
                  }}
                >
                  <Icon />
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{ color: 'text.primary', fontWeight: 600 }}
                >
                  {title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {description}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
