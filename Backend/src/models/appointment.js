const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    doctorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    reason: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        trim: true
    }
}, { timestamps: true });

const Appointment = mongoose.model('appointments', appointmentSchema);

module.exports = Appointment;
