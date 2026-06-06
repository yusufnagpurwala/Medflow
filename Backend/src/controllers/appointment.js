const mongoose = require('mongoose');
const Appointment = require('../models/appointment');
const User = require('../models/user');
const Availability = require('../models/availability');

// Convert "HH:MM" -> minutes since midnight.
const timeToMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

// Pad a number to two digits.
const pad2 = (n) => String(n).padStart(2, '0');

// SINGLE SOURCE OF TRUTH for slot computation. Used by both getSlots and
// createAppointment to prevent logic drift.
//
// TIMEZONE ASSUMPTION: slot Date objects are built in SERVER-LOCAL time from
// the requested calendar date (year/month/day) plus each window's "HH:MM".
// The returned `iso` is the standard ISO string of that local Date. Callers
// (getSlots returns iso; createAppointment compares the stored appointmentDate
// against these local Dates by getTime()), so everything stays consistent as
// long as the server's timezone is stable.
//
// `date` is a Date whose Y/M/D identify the target calendar day.
// Returns { hasAvailability, slotDuration, slots:[{ time, iso, available }] }.
const computeSlots = async (doctorId, date) => {
    const availability = await Availability.findOne({ doctorId });
    if (!availability) {
        return { hasAvailability: false, slotDuration: null, slots: [] };
    }

    const slotDuration = availability.slotDuration;
    const year = date.getFullYear();
    const month = date.getMonth();
    const dayOfMonth = date.getDate();
    const weekday = date.getDay(); // 0=Sun .. 6=Sat, server-local

    // Enumerate candidate slot start times across all matching windows,
    // deduped by "HH:MM" so overlapping windows don't produce duplicates.
    const byTime = new Map();
    for (const w of availability.windows) {
        if (w.day !== weekday) continue;

        const startMin = timeToMinutes(w.startTime);
        const endMin = timeToMinutes(w.endTime);

        for (let m = startMin; m + slotDuration <= endMin; m += slotDuration) {
            const hh = Math.floor(m / 60);
            const mm = m % 60;
            const timeStr = `${pad2(hh)}:${pad2(mm)}`;
            if (byTime.has(timeStr)) continue;
            const slotStart = new Date(year, month, dayOfMonth, hh, mm, 0, 0);
            byTime.set(timeStr, slotStart);
        }
    }

    // Build the day's [start, end) bounds in server-local time to fetch
    // active appointments and detect taken slots.
    const dayStart = new Date(year, month, dayOfMonth, 0, 0, 0, 0);
    const dayEnd = new Date(year, month, dayOfMonth + 1, 0, 0, 0, 0);

    // Taken = any non-cancelled appointment occupying the slot. Keyed on
    // status (not `active`) so legacy docs lacking the `active` field are still
    // detected as taken — prevents booking over existing appointments.
    const taken = await Appointment.find({
        doctorId,
        status: { $in: ['pending', 'confirmed', 'completed'] },
        appointmentDate: { $gte: dayStart, $lt: dayEnd }
    });
    const takenTimes = new Set(taken.map((a) => new Date(a.appointmentDate).getTime()));

    const now = Date.now();
    const slots = [...byTime.entries()]
        .map(([time, slotStart]) => {
            const isFuture = slotStart.getTime() > now;
            const isTaken = takenTimes.has(slotStart.getTime());
            return {
                time,
                iso: slotStart.toISOString(),
                available: isFuture && !isTaken
            };
        })
        .sort((a, b) => a.time.localeCompare(b.time));

    return { hasAvailability: true, slotDuration, slots };
};

exports.createAppointment = async (req, res) => {
    try {
        const { doctorId, appointmentDate, reason } = req.body;

        if(!doctorId || !appointmentDate){
            return res.status(400).json({ success: false, message: 'Doctor and date are required.' });
        }

        const doctor = await User.findById(doctorId);
        if(!doctor || doctor.role !== 'doctor'){
            return res.status(404).json({ success: false, message: 'Doctor not found.' });
        }

        // Validate the requested datetime against freshly computed slots
        // (same helper as getSlots) so a patient can only book a real,
        // currently-available slot.
        const requested = new Date(appointmentDate);
        if (isNaN(requested.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid appointment date.' });
        }

        const { slots } = await computeSlots(doctorId, requested);
        const match = slots.find(
            (s) => new Date(s.iso).getTime() === requested.getTime() && s.available === true
        );
        if (!match) {
            return res.status(400).json({ success: false, message: 'Selected slot is not available.' });
        }

        try {
            const appointment = await Appointment.create({
                doctorId: doctorId,
                patientId: req.user.id,
                appointmentDate: appointmentDate,
                reason: reason,
                status: 'pending',
                active: true
            });

            res.status(201).json({ success: true, data: appointment });
        } catch (error) {
            // Duplicate key from the partial unique index => slot was taken
            // by a concurrent request between our check and the insert.
            if (error.code === 11000) {
                return res.status(409).json({ success: false, message: 'Slot already booked.' });
            }
            throw error;
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!mongoose.isValidObjectId(doctorId)) {
            return res.status(400).json({ success: false, message: 'Invalid doctor id' });
        }

        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ success: false, message: 'Doctor not found.' });
        }

        if (!date) {
            return res.status(400).json({ success: false, message: 'date (YYYY-MM-DD) is required.' });
        }
        // Parse YYYY-MM-DD into explicit LOCAL parts. `new Date("YYYY-MM-DD")`
        // would parse as UTC midnight, shifting the weekday on sub-UTC servers
        // and generating slots for the wrong day. Build local midnight instead.
        const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
        if (!dateMatch) {
            return res.status(400).json({ success: false, message: 'Invalid date. Expected YYYY-MM-DD.' });
        }
        const parsed = new Date(
            Number(dateMatch[1]),
            Number(dateMatch[2]) - 1,
            Number(dateMatch[3])
        );
        if (isNaN(parsed.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date.' });
        }

        const { hasAvailability, slotDuration, slots } = await computeSlots(doctorId, parsed);

        return res.json({
            success: true,
            data: { date, slotDuration, hasAvailability, slots }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getAppointments = async (req, res) => {

    try {
        const { role, id } = req.user;
        let filter = {};
        if(role === 'doctor'){
            filter = { doctorId: id }
        } else if(role == 'patient'){
            filter = { patientId: id }
        }

        const appointments = await Appointment.find(filter)
        .populate('doctorId', 'name email')
        .populate('patientId', 'name email')
        .sort({ appointmentDate: 1 });

        res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getAppointmentById = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const id = req.params.id;

        const appointment = await Appointment.findById(id)
        .populate('doctorId', 'name email')
        .populate('patientId', 'name email');

        if(!appointment){
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }

        // Access control
        if(role === 'doctor' && appointment.doctorId._id.toString() !== userId || role === 'patient' && appointment.patientId._id.toString() !== userId){
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        return res.json({ success: true, data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const id = req.params.id;
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

        if(!validStatuses.includes(status)){
            return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }

        const appointment = await Appointment.findById(id);
        if(!appointment){
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }
        // Only doctor can update status
        if(role !== 'doctor' || appointment.doctorId.toString() !== userId){
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        appointment.status = status;
        // Cancelling frees the slot: active:false drops the doc out of the
        // partial unique index so the time can be rebooked.
        appointment.active = (status !== 'cancelled');

        try {
            await appointment.save();
        } catch (saveErr) {
            // Re-activating a cancelled appointment whose slot was booked by
            // someone else in the meantime collides with the partial unique index.
            if (saveErr.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'That time slot is no longer free.'
                });
            }
            throw saveErr;
        }

        return res.json({ success: true, message: 'Status updated', data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.addNotes = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const id = req.params.id;
        const { notes } = req.body;

        const appointment = await Appointment.findById(id);
        if(!appointment){
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }
        // Only doctor can add notes
        if(role !== 'doctor' || appointment.doctorId.toString() !== userId){
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        appointment.notes = notes;
        await appointment.save();
        return res.json({ success: true, message: 'Notes added', data: appointment });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getDoctorAnalytics = async (req, res) => {
    try {
        const doctorId = new mongoose.Types.ObjectId(req.user.id);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const statusAgg = await Appointment.aggregate([
            { $match: { doctorId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const byStatus = statusAgg.map((item) => ({
            status: item._id,
            count: item.count
        }));

        const trendAgg = await Appointment.aggregate([
            { $match: { doctorId, createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        const trend = trendAgg.map((item) => ({
            date: item._id,
            count: item.count
        }));

        const total = await Appointment.countDocuments({ doctorId });

        return res.json({ success: true, data: { byStatus, trend, total } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}