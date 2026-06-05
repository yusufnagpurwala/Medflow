const mongoose = require('mongoose');
const User = require('../models/user');
const Appointment = require('../models/appointment');

exports.getPendingDoctors = async (req, res) => {
    try {
        const data = await User.find({ role: 'doctor', status: 'pending' }).select('-password');
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.approveDoctor = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid user id' });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role !== 'doctor') {
            return res.status(400).json({ success: false, message: 'User is not a doctor' });
        }
        user.status = 'approved';
        await user.save();

        const safeUser = user.toObject();
        delete safeUser.password;

        res.status(200).json({ success: true, message: 'Doctor approved', data: safeUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.rejectDoctor = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid user id' });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role !== 'doctor') {
            return res.status(400).json({ success: false, message: 'User is not a doctor' });
        }
        user.status = 'rejected';
        await user.save();

        const safeUser = user.toObject();
        delete safeUser.password;

        res.status(200).json({ success: true, message: 'Doctor rejected', data: safeUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getStats = async (req, res) => {
    try {
        const patients = await User.countDocuments({ role: 'patient' });
        const doctors = await User.countDocuments({ role: 'doctor' });
        const pendingDoctors = await User.countDocuments({ role: 'doctor', status: 'pending' });
        const appointments = await Appointment.countDocuments();

        res.status(200).json({
            success: true,
            data: { patients, doctors, pendingDoctors, appointments }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const data = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getAllDoctors = async (req, res) => {
    try {
        const data = await User.find({ role: 'doctor' }).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getAllPatients = async (req, res) => {
    try {
        const data = await User.find({ role: 'patient' }).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getAllAppointments = async (req, res) => {
    try {
        const data = await Appointment.find()
            .populate('doctorId', 'name email')
            .populate('patientId', 'name email')
            .sort({ appointmentDate: -1 });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
