import React from 'react';
import Chip from '@mui/material/Chip';


const STATUS_COLOR = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'error',
  approved: 'success',
  rejected: 'error',
};

const capitalize = (s) =>
  typeof s === 'string' && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;

export default function StatusChip({ status, ...rest }) {
  const key = typeof status === 'string' ? status.toLowerCase() : '';
  const color = STATUS_COLOR[key] || 'default';
  const label = capitalize(status) || 'Unknown';

  return <Chip size="small" color={color} label={label} {...rest} />;
}
