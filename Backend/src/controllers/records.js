const Record = require('../models/records');
const User = require('../models/user')

exports.createRecord = async (req, res) => {
    try {
        const { patientId, appointmentId, diagnosis, prescription, notes, followUp, attachments } = req.body;

        if(!patientId || !diagnosis ){
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const patient = await User.findById(patientId);
        if(!patient || patient.role !== 'patient'){
            return res.status(400).json({ success: false, message: 'Invalid patientId' });
        }

        const record = await Record.create({
            doctorId: req.user.id,
            patientId: patientId,
            appointmentId: appointmentId || null,
            diagnosis: diagnosis,
            prescription: prescription,
            notes: notes || null,
            followUp: followUp || null,
            attachments: attachments || []
        })

        return res.status(201).json({ success: true, data: record });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

exports.getRecords = async (req, res) => {
    try {
        let filter = {};

        if(req.user.role === 'doctor'){
            filter = { doctorId: req.user.id };
        } else if(req.user.role === 'patient'){
            filter = { patientId: req.user.id };
        }

        const records = await Record.find(filter)
        .populate('doctorId', 'name email')
        .populate('patientId', 'name email')
        .populate('appointmentId')
        .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

exports.getRecordById = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const record = await Record.findOne({ appointmentId })
        .populate('doctorId', 'name')
        .populate('patientId', 'name')
        .populate('appointmentId');

        if(!record){
            return res.status(404).json({ success: false, message: 'Record not found.' });
        }

        if(req.user.role === 'doctor' && record.doctorId._id.toString() !== req.user.id){
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if(req.user.role === 'patient' && record.patientId._id.toString() !== req.user.id){
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        return res.json({ success: true, data: record });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

exports.updateRecord = async (req, res) => {
    try {
        const id = req.params.id;
        const { diagnosis, prescription, notes, followUp, attachments } = req.body;
        const record = await Record.findById(id)
         if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        if (record.doctorId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You can only update your own records' });
        }

        if(diagnosis) record.diagnosis = diagnosis;
        if(prescription) record.prescription = prescription;
        if(notes) record.notes = notes;
        if(followUp) record.followUp = followUp;
        if(attachments) record.attachments = attachments;

        await record.save();

        return res.status(200).json({ success: true,message: 'Record updated', data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: err.message });
    }
}