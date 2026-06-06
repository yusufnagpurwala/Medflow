const mongoose = require('mongoose');
const Appointment = require('../models/appointment');

const connectionDB = async (uri) => {
   try{
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Explicitly build/verify indexes (incl. the partial unique index that
        // guards against double-booking). syncIndexes surfaces build failures
        // loudly instead of silently leaving the app without the guard.
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