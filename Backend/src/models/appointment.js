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
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Concurrency-safe double-book guard: the DB rejects two ACTIVE appointments
// for the same doctor at the same datetime. Cancelled appointments set
// active:false and therefore fall out of this partial index, freeing the slot.
appointmentSchema.index(
    { doctorId: 1, appointmentDate: 1 },
    { unique: true, partialFilterExpression: { active: true } }
);

const Appointment = mongoose.model('appointments', appointmentSchema);

module.exports = Appointment;
