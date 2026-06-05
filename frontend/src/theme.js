import { createTheme } from '@mui/material/styles';

/**
 * MedFlow design system — "Teal + Slate".
 *
 * Single source of truth for palette, typography, shape and component
 * overrides. Build the theme via createAppTheme(fontFamily) so the
 * font (loaded with next/font in _app.js) can be injected as a CSS var.
 */

// Soft, subtle elevation used across cards/menus.
const CARD_SHADOW =
  '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)';
const ELEVATED_SHADOW = '0 4px 12px rgba(15,23,42,0.08)';

const DIVIDER = '#E2E8F0';

/**
 * @param {string} fontFamily - resolved font-family string (e.g. the
 *   next/font CSS variable plus system fallbacks).
 * @returns {import('@mui/material/styles').Theme}
 */
export function createAppTheme(fontFamily) {
  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#0D9488', // teal
        dark: '#0F766E',
        light: '#5EEAD4',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#10B981', // emerald
        dark: '#059669',
        light: '#6EE7B7',
        contrastText: '#FFFFFF',
      },
      // Custom "neutral" channel — slate. Usable as color="neutral"
      // once augmented below, and via theme.palette.neutral in sx.
      neutral: {
        main: '#64748B',
        contrastText: '#FFFFFF',
      },
      error: { main: '#EF4444' },
      warning: { main: '#F59E0B' },
      info: { main: '#3B82F6' },
      success: { main: '#22C55E' },
      text: {
        primary: '#0F172A',
        secondary: '#64748B',
      },
      background: {
        default: '#F8FAFC',
        paper: '#FFFFFF',
      },
      divider: DIVIDER,
    },

    shape: {
      borderRadius: 12,
    },

    typography: {
      fontFamily,
      // Headings: weighted 600–700 with slightly tightened tracking
      // for a crisp, modern feel.
      h1: { fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.015em' },
      h4: { fontWeight: 700, letterSpacing: '-0.015em' },
      h5: { fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600, letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 500 },
      subtitle2: { fontWeight: 600 },
      button: { fontWeight: 600 },
    },

    components: {
      // ---- Buttons -----------------------------------------------------
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 10,
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 18,
            paddingRight: 18,
            boxShadow: 'none',
            transition:
              'background-color .18s ease, box-shadow .18s ease, transform .05s ease',
          },
          // No shadow on contained by default, subtle one on hover.
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: ELEVATED_SHADOW,
            },
          },
          outlined: {
            '&:hover': {
              backgroundColor: 'rgba(13,148,136,0.04)',
            },
          },
          text: {
            '&:hover': {
              backgroundColor: 'rgba(13,148,136,0.06)',
            },
          },
        },
      },

      // ---- Surfaces ----------------------------------------------------
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          rounded: {
            borderRadius: 12,
          },
          // Outlined paper: hairline slate border, no shadow.
          outlined: {
            border: `1px solid ${DIVIDER}`,
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: CARD_SHADOW,
          },
        },
      },

      // ---- Chips -------------------------------------------------------
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
          },
        },
      },

      // ---- App bar -----------------------------------------------------
      MuiAppBar: {
        defaultProps: {
          color: 'inherit',
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            boxShadow: 'none',
            borderBottom: `1px solid ${DIVIDER}`,
          },
        },
      },

      // ---- Inputs ------------------------------------------------------
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
      },
    },
  });
}

export default createAppTheme;
