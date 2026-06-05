import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import Button from '@mui/material/Button';

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
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to MedFlow</h1>
      <p>Please login or sign up to continue.</p>
      <div style={{ marginTop: '20px' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/login')}
          style={{ marginRight: '10px' }}
        >
          Login
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => router.push('/signup')}
        >
          Signup
        </Button>
      </div>
    </div>
  );
}