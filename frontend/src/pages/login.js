import React, { useState } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { FormCard, ThemeToggle } from "@/components";
import { useAuthStore } from "@/store/authStore";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth)
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user } = res.data;
      setAuth(user);

      if (user.role === 'doctor') {
        router.push('/dashboard/doctor')
      } else if (user.role === 'patient') {
        router.push('/dashboard/patient')
      } else if (user.role === 'admin') {
        router.push('/dashboard/admin')
      } else {
        router.push('/login')
      }
      // leave loading=true on success: spinner persists through the redirect

    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
        <ThemeToggle />
      </Box>

      {/* Brand panel */}
      <Box
        sx={{
          flex: { md: 1 },
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          gap: 3,
          p: 8,
          color: "primary.contrastText",
          background:
            "linear-gradient(160deg, #0D9488 0%, #0F766E 100%)",
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <LocalHospitalIcon sx={{ fontSize: 36 }} />
          <Typography variant="h5" component="span" sx={{ fontWeight: 700 }}>
            MedFlow
          </Typography>
        </Stack>
        <Typography variant="h3" component="p" sx={{ maxWidth: 420 }}>
          Healthcare management, simplified.
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, maxWidth: 420 }}>
          Appointments, doctors, and medical records — together in one secure
          place.
        </Typography>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          flex: { md: 1 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 6 },
          bgcolor: "background.default",
        }}
      >
        <FormCard
          maxWidth={420}
          title="Welcome back"
          subtitle="Sign in to your MedFlow account."
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={submit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                fullWidth
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || !email.trim() || !password}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? "Signing in..." : "Login"}
              </Button>
            </Stack>
          </form>
          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 3, color: "text.secondary" }}
          >
            No account?{" "}
            <Link
              component="button"
              type="button"
              onClick={() => router.push("/signup")}
              sx={{ fontWeight: 600 }}
            >
              Sign Up
            </Link>
          </Typography>
        </FormCard>
      </Box>
    </Box>
  )
}
