const User = require('../models/user');

exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' })
        .select('_id name specialization');
        res.status(200).json({ success: true, data: doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}