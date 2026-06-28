const mongoose = require('mongoose');
const Appointment = require('../models/appointment');

const connectionDB = async (uri) => {
   try{
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        try {
            await Appointment.syncIndexes();
            console.log('Appointment indexes synced');
        } catch (idxErr) {
            console.error(`Index sync FAILED (double-book guard not active): ${idxErr.message}`);
        }
    } catch(err){
        console.error(`DB Connection Error: ${err.message}`);
        process.exit(1);
    }
}

module.exports = connectionDB;