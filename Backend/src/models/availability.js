const mongoose = require('mongoose');

// Weekly-recurring availability for a doctor. Heavy validation
// (time format, ordering, slot-fit) is performed in the controller;
// the schema stays intentionally simple.
const windowSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: true,
        min: 0,
        max: 6
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    }
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        unique: true
    },
    slotDuration: {
        type: Number,
        enum: [15, 20, 30, 45, 60],
        default: 30
    },
    windows: [windowSchema]
}, { timestamps: true });

const Availability = mongoose.model('availabilities', availabilitySchema);

module.exports = Availability;
