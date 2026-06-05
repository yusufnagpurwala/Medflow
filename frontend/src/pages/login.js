import React, { useState } from "react";
// import { useAuthStore } from '../store/authStore'
import { useRouter } from "next/router";
import api from "@/lib/api";
import { Alert, Box, Button, Container, TextField, Typography } from "@mui/material";
import { useAuthStore } from "@/store/authStore";

export default function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const setAuth = useAuthStore((s) => s.setAuth)
    const router = useRouter();

    const submit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password });
            const { user, token } = await res.data;
            setAuth(user, token);

            if(user.role === 'doctor') {
                router.push('/dashboard/doctor')
            } else if (user.role === 'patient'){
                router.push('/dashboard/patient')
            } else {
                router.push('/dashboard')
            }
            
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    }

    return (
        <Container maxWidth="xs">
        <Box mt={10}>
        <Typography variant="h5" align="center" gutterBottom>MedFlow Login</Typography>
        {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
        )}
        <form onSubmit={submit}>
          <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <TextField label="Password" fullWidth margin="normal" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Login</Button>
        </form>
      </Box>
    </Container>
    )
}