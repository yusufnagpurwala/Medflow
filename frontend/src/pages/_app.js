import React, { useEffect } from 'react';
import Head from 'next/head';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import '../styles/globals.css'
import { useAuthStore } from '@/store/authStore';

const theme = createTheme({
  palette: { mode: 'light' }
})

export default function MyApp({ Component, pageProps }) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  if(!isHydrated) return null;
  return (
    <>
      <Head>
        <title>MedFlow</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}
