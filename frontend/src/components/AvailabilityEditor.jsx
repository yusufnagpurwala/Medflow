import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

const SLOT_DURATIONS = [15, 20, 30, 45, 60];

// Display order Mon..Sun mapped to backend day numbers (0=Sun..6=Sat).
const DAYS = [
  { num: 1, label: 'Monday' },
  { num: 2, label: 'Tuesday' },
  { num: 3, label: 'Wednesday' },
  { num: 4, label: 'Thursday' },
  { num: 5, label: 'Friday' },
  { num: 6, label: 'Saturday' },
  { num: 0, label: 'Sunday' },
];

const DEFAULT_WINDOW = { startTime: '09:00', endTime: '17:00' };

// "HH:MM" -> minutes since midnight.
function toMinutes(hhmm) {
  if (typeof hhmm !== 'string' || !/^\d{2}:\d{2}$/.test(hhmm)) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// Build the per-day editing model from an availability object (or null).
function buildState(value) {
  const grouped = {};
  DAYS.forEach((d) => {
    grouped[d.num] = [];
  });
  const windows = Array.isArray(value?.windows) ? value.windows : [];
  windows.forEach((w) => {
    if (grouped[w.day]) {
      grouped[w.day].push({ startTime: w.startTime, endTime: w.endTime });
    }
  });
  return {
    slotDuration: value?.slotDuration || 30,
    windowsByDay: grouped,
  };
}

// Validate a single window against the chosen slot duration.
function windowError(win, slotDuration) {
  const start = toMinutes(win.startTime);
  const end = toMinutes(win.endTime);
  if (start === null || end === null) return 'Enter a valid time';
  if (start >= end) return 'Start must be before end';
  if (end - start < slotDuration) return `Window must be at least ${slotDuration} min`;
  return '';
}

export default function AvailabilityEditor({ value, onSave, saving = false }) {
  // State is seeded from `value` on mount. Parents pass a `key` derived from
  // the value identity so React remounts (re-inits) this editor when the
  // upstream availability changes (e.g. after a refetch) — the recommended
  // pattern over syncing via an effect.
  const [slotDuration, setSlotDuration] = useState(() => value?.slotDuration || 30);
  const [windowsByDay, setWindowsByDay] = useState(() => buildState(value).windowsByDay);

  const addWindow = (dayNum) => {
    setWindowsByDay((prev) => ({
      ...prev,
      [dayNum]: [...prev[dayNum], { ...DEFAULT_WINDOW }],
    }));
  };

  const removeWindow = (dayNum, index) => {
    setWindowsByDay((prev) => ({
      ...prev,
      [dayNum]: prev[dayNum].filter((_, i) => i !== index),
    }));
  };

  const updateWindow = (dayNum, index, field, val) => {
    setWindowsByDay((prev) => ({
      ...prev,
      [dayNum]: prev[dayNum].map((w, i) => (i === index ? { ...w, [field]: val } : w)),
    }));
  };

  // True when no window across any day is invalid.
  const hasInvalid = useMemo(
    () =>
      DAYS.some((d) =>
        windowsByDay[d.num].some((w) => windowError(w, slotDuration) !== '')
      ),
    [windowsByDay, slotDuration]
  );

  const handleSave = () => {
    if (hasInvalid || saving) return;
    const windows = [];
    DAYS.forEach((d) => {
      windowsByDay[d.num].forEach((w) => {
        windows.push({ day: d.num, startTime: w.startTime, endTime: w.endTime });
      });
    });
    onSave({ slotDuration, windows });
  };

  return (
    <Card sx={{ p: { xs: 2.5, sm: 3 } }}>
      <Stack spacing={3}>
        <Box sx={{ maxWidth: 260 }}>
          <TextField
            select
            fullWidth
            label="Slot duration"
            value={slotDuration}
            onChange={(e) => setSlotDuration(Number(e.target.value))}
            helperText="Length of each appointment slot"
          >
            {SLOT_DURATIONS.map((d) => (
              <MenuItem key={d} value={d}>
                {d} minutes
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Divider />

        <Stack spacing={2.5}>
          {DAYS.map((day) => {
            const wins = windowsByDay[day.num];
            return (
              <Box key={day.num}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {day.label}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => addWindow(day.num)}
                  >
                    Add window
                  </Button>
                </Stack>

                {wins.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Unavailable
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {wins.map((win, index) => {
                      const err = windowError(win, slotDuration);
                      return (
                        <Stack
                          key={index}
                          direction="row"
                          spacing={1.5}
                          alignItems="flex-start"
                        >
                          <TextField
                            type="time"
                            label="Start"
                            size="small"
                            value={win.startTime}
                            onChange={(e) =>
                              updateWindow(day.num, index, 'startTime', e.target.value)
                            }
                            error={Boolean(err)}
                            inputProps={{ step: 300 }}
                            sx={{ width: 140 }}
                          />
                          <TextField
                            type="time"
                            label="End"
                            size="small"
                            value={win.endTime}
                            onChange={(e) =>
                              updateWindow(day.num, index, 'endTime', e.target.value)
                            }
                            error={Boolean(err)}
                            helperText={err || ' '}
                            inputProps={{ step: 300 }}
                            sx={{ width: 200 }}
                          />
                          <Tooltip title="Remove window">
                            <IconButton
                              aria-label="Remove window"
                              color="error"
                              onClick={() => removeWindow(day.num, index)}
                              sx={{ mt: 0.5 }}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            );
          })}
        </Stack>

        <Divider />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            disabled={saving || hasInvalid}
            onClick={handleSave}
          >
            {saving ? 'Saving...' : 'Save Availability'}
          </Button>
        </Box>
      </Stack>
    </Card>
  );
}
