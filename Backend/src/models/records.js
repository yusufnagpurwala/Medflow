const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'appointments',
        unique: true,
        required: true
    },
    diagnosis: {
        type: String,
        required: true
    },
    prescription: {
        type: String,
    },
    notes: {
        type: String,
    },
    followUp: {
        type: String,
    },
    attachments: [String]
}, { timestamps: true });

const Record = mongoose.model('records', recordSchema);
module.exports = Record;