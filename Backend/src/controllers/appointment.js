const Appointment = require('../models/appointment');
const User = require('../models/user');

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

        const appointment = await Appointment.create({
            doctorId: doctorId,
            patientId: req.user.id,
            appointmentDate: appointmentDate,
            reason: reason,
            status: 'pending'
        })

        res.status(201).json({ success: true, data: appointment });
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
        await appointment.save();

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