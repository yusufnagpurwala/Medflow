import React, { useState } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { FormCard, ThemeToggle } from "@/components";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [role, setRole] = useState("patient");
  const [specialization, setSpecialization] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const isValid =
    name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(email) &&
    password.length >= 6 &&
    Number(age) > 0 &&
    (role !== "doctor" || specialization.trim().length > 0);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValid) {
      setError("Please fill all fields correctly.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        age: Number(age),
        role,
        specialization: role === "doctor" ? specialization.trim() : undefined,
      });
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

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
          background: "linear-gradient(160deg, #0D9488 0%, #0F766E 100%)",
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
          maxWidth={460}
          title="Create your account"
          subtitle="Join MedFlow to manage your care."
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={submit}>
            <Stack spacing={2}>
              <TextField
                label="Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={password.length > 0 && password.length < 6}
                helperText="Minimum 6 characters"
              />
              <TextField
                label="Age"
                type="number"
                fullWidth
                value={age}
                onChange={(e) => setAge(e.target.value)}
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Role"
                select
                fullWidth
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
              </TextField>

              <Collapse in={role === "doctor"} unmountOnExit>
                <Stack spacing={2}>
                  <TextField
                    label="Specialization"
                    fullWidth
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Cardiology"
                  />
                  <Alert severity="info">
                    Doctor accounts require admin approval before first login.
                  </Alert>
                </Stack>
              </Collapse>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={!isValid || submitting}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {submitting ? "Creating account..." : "Sign Up"}
              </Button>
            </Stack>
          </form>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 3, color: "text.secondary" }}
          >
            Already have an account?{" "}
            <Link
              component="button"
              type="button"
              onClick={() => router.push("/login")}
              sx={{ fontWeight: 600 }}
            >
              Login
            </Link>
          </Typography>
        </FormCard>
      </Box>
    </Box>
  );
}
