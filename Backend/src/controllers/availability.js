const mongoose = require('mongoose');
const Availability = require('../models/availability');
const User = require('../models/user');

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const ALLOWED_DURATIONS = [15, 20, 30, 45, 60];

// Convert "HH:MM" -> minutes since midnight.
const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

// Shared validation helper. Returns { valid, message, clean }.
// `clean` holds the normalized { slotDuration, windows } when valid.
const validateAvailabilityPayload = (body) => {
    const payload = body || {};

    let slotDuration = payload.slotDuration;
    if (slotDuration === undefined || slotDuration === null) {
        slotDuration = 30;
    }
    if (!ALLOWED_DURATIONS.includes(slotDuration)) {
        return { valid: false, message: 'slotDuration must be one of 15, 20, 30, 45, 60.' };
    }

    const windows = payload.windows;
    if (!Array.isArray(windows)) {
        return { valid: false, message: 'windows must be an array.' };
    }

    const clean = { slotDuration, windows: [] };

    for (let i = 0; i < windows.length; i++) {
        const w = windows[i] || {};
        const { day, startTime, endTime } = w;

        if (!Number.isInteger(day) || day < 0 || day > 6) {
            return { valid: false, message: `windows[${i}].day must be an integer between 0 and 6.` };
        }
        if (typeof startTime !== 'string' || !TIME_RE.test(startTime)) {
            return { valid: false, message: `windows[${i}].startTime must match HH:MM (24h).` };
        }
        if (typeof endTime !== 'string' || !TIME_RE.test(endTime)) {
            return { valid: false, message: `windows[${i}].endTime must match HH:MM (24h).` };
        }

        const startMin = toMinutes(startTime);
        const endMin = toMinutes(endTime);
        if (startMin >= endMin) {
            return { valid: false, message: `windows[${i}] startTime must be before endTime.` };
        }
        if (endMin - startMin < slotDuration) {
            return { valid: false, message: `windows[${i}] must fit at least one ${slotDuration}-minute slot.` };
        }

        clean.windows.push({ day, startTime, endTime });
    }

    // Reject overlapping windows on the same day — overlaps would otherwise
    // produce phase-shifted, physically-overlapping bookable slots.
    const byDay = {};
    for (const w of clean.windows) {
        (byDay[w.day] = byDay[w.day] || []).push(w);
    }
    for (const day of Object.keys(byDay)) {
        const sorted = byDay[day].slice().sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
        for (let i = 1; i < sorted.length; i++) {
            if (toMinutes(sorted[i].startTime) < toMinutes(sorted[i - 1].endTime)) {
                return { valid: false, message: `Overlapping time windows on day ${day}.` };
            }
        }
    }

    return { valid: true, message: null, clean };
};

exports.getMyAvailability = async (req, res) => {
    try {
        const data = await Availability.findOne({ doctorId: req.user.id });
        res.status(200).json({ success: true, data: data || null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.upsertMyAvailability = async (req, res) => {
    try {
        const { valid, message, clean } = validateAvailabilityPayload(req.body);
        if (!valid) {
            return res.status(400).json({ success: false, message });
        }

        const data = await Availability.findOneAndUpdate(
            { doctorId: req.user.id },
            { slotDuration: clean.slotDuration, windows: clean.windows },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDoctorAvailability = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid doctor id' });
        }

        const doctor = await User.findById(req.params.id);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ success: false, message: 'Doctor not found.' });
        }

        const data = await Availability.findOne({ doctorId: req.params.id });
        res.status(200).json({ success: true, data: data || null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.upsertDoctorAvailability = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid doctor id' });
        }

        const doctor = await User.findById(req.params.id);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ success: false, message: 'Doctor not found.' });
        }

        const { valid, message, clean } = validateAvailabilityPayload(req.body);
        if (!valid) {
            return res.status(400).json({ success: false, message });
        }

        const data = await Availability.findOneAndUpdate(
            { doctorId: req.params.id },
            { slotDuration: clean.slotDuration, windows: clean.windows },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.validateAvailabilityPayload = validateAvailabilityPayload;
