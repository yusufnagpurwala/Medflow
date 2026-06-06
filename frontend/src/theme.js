import { createTheme } from '@mui/material/styles';

/**
 * MedFlow design system — "Teal + Slate".
 *
 * Single source of truth for palette, typography, shape and component
 * overrides. Build the theme via createAppTheme(mode, fontFamily) so the
 * color mode ('light' | 'dark') can be toggled at runtime and the font
 * (loaded with next/font in _app.js) can be injected as a CSS var.
 */

// Soft, subtle elevation used across cards/menus.
const CARD_SHADOW =
  '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)';
const ELEVATED_SHADOW = '0 4px 12px rgba(15,23,42,0.08)';

// Darker surfaces need deeper shadows to read as elevation.
const CARD_SHADOW_DARK =
  '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)';
const ELEVATED_SHADOW_DARK = '0 4px 12px rgba(0,0,0,0.5)';

const DIVIDER_LIGHT = '#E2E8F0';
const DIVIDER_DARK = '#1E293B';

/**
 * Per-mode color tokens. Light keeps the original Teal/Slate values; dark
 * is a slate-based surface set with a slightly brightened teal so primary
 * actions stay legible on dark backgrounds.
 */
const TOKENS = {
  light: {
    primary: {
      main: '#0D9488',
      dark: '#0F766E',
      light: '#5EEAD4',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#10B981',
      dark: '#059669',
      light: '#6EE7B7',
      contrastText: '#FFFFFF',
    },
    neutral: { main: '#64748B', contrastText: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#64748B' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    divider: DIVIDER_LIGHT,
    appBarBg: '#FFFFFF',
    appBarText: '#0F172A',
    cardShadow: CARD_SHADOW,
    elevatedShadow: ELEVATED_SHADOW,
  },
  dark: {
    primary: {
      main: '#2DD4BF', // brightened teal for dark surfaces
      dark: '#14B8A6',
      light: '#5EEAD4',
      contrastText: '#042F2E',
    },
    secondary: {
      main: '#34D399',
      dark: '#10B981',
      light: '#6EE7B7',
      contrastText: '#022C22',
    },
    neutral: { main: '#94A3B8', contrastText: '#0F172A' },
    text: { primary: '#F1F5F9', secondary: '#94A3B8' },
    background: { default: '#0B1120', paper: '#0F172A' },
    divider: DIVIDER_DARK,
    appBarBg: '#0F172A',
    appBarText: '#F1F5F9',
    cardShadow: CARD_SHADOW_DARK,
    elevatedShadow: ELEVATED_SHADOW_DARK,
  },
};

/**
 * @param {'light'|'dark'} [mode='light'] - active color mode.
 * @param {string} fontFamily - resolved font-family string (e.g. the
 *   next/font CSS variable plus system fallbacks).
 * @returns {import('@mui/material/styles').Theme}
 */
export function createAppTheme(mode = 'light', fontFamily) {
  const t = TOKENS[mode] || TOKENS.light;
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: t.primary,
      secondary: t.secondary,
      // Custom "neutral" channel — slate. Usable as color="neutral"
      // once augmented below, and via theme.palette.neutral in sx.
      neutral: t.neutral,
      error: { main: '#EF4444' },
      warning: { main: '#F59E0B' },
      info: { main: '#3B82F6' },
      success: { main: '#22C55E' },
      text: t.text,
      background: t.background,
      divider: t.divider,
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
              boxShadow: t.elevatedShadow,
            },
          },
          outlined: {
            '&:hover': {
              backgroundColor: isDark
                ? 'rgba(45,212,191,0.08)'
                : 'rgba(13,148,136,0.04)',
            },
          },
          text: {
            '&:hover': {
              backgroundColor: isDark
                ? 'rgba(45,212,191,0.12)'
                : 'rgba(13,148,136,0.06)',
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
            border: `1px solid ${t.divider}`,
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
            boxShadow: t.cardShadow,
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
            backgroundColor: t.appBarBg,
            color: t.appBarText,
            boxShadow: 'none',
            borderBottom: `1px solid ${t.divider}`,
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
