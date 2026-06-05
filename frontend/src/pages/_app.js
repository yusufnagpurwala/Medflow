import React, { useMemo } from 'react';
import Head from 'next/head';
import { Plus_Jakarta_Sans } from 'next/font/google';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import '../styles/globals.css';
import { useAuthStore } from '@/store/authStore';
import { createAppTheme } from '@/theme';

// Load the brand font and expose it as a CSS variable so the theme
// (and any plain CSS) can reference it.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

// Branded full-screen splash shown until the auth store rehydrates.
function BrandedSplash() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        bgcolor: 'background.default',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <LocalHospitalIcon sx={{ color: 'primary.main', fontSize: 36 }} />
        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
          MedFlow
        </Typography>
      </Stack>
      <CircularProgress color="primary" />
    </Box>
  );
}

export default function MyApp({ Component, pageProps }) {
  const isHydrated = useAuthStore((s) => s.isHydrated);

  // Inject the loaded font variable as the theme font-family.
  const theme = useMemo(
    () => createAppTheme(`var(--font-jakarta), system-ui, sans-serif`),
    []
  );

  return (
    <>
      <Head>
        <title>MedFlow</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      {/* Wrapping element carries the font CSS variable className. */}
      <div className={jakarta.variable}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {isHydrated ? <Component {...pageProps} /> : <BrandedSplash />}
        </ThemeProvider>
      </div>
    </>
  );
}
