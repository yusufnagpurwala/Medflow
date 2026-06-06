import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import { useUiStore } from '@/store/uiStore';

/**
 * Icon button that toggles the app color mode (light <-> dark).
 *
 * Reads/writes the persisted UI store so the choice survives refreshes.
 * Safe to render anywhere — works on both authenticated shells and the
 * pre-auth marketing/auth pages.
 *
 * @param {object} [props]
 * @param {object} [props.sx] - sx overrides forwarded to the IconButton.
 * @param {'small'|'medium'|'large'} [props.size] - icon button size.
 */
export default function ThemeToggle({ sx, size = 'medium' }) {
  const mode = useUiStore((s) => s.mode);
  const toggleMode = useUiStore((s) => s.toggleMode);
  const isDark = mode === 'dark';

  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Tooltip title={label}>
      <IconButton
        onClick={toggleMode}
        size={size}
        aria-label={label}
        sx={{ color: 'text.secondary', ...sx }}
      >
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
