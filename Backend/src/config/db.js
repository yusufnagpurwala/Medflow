const mongoose = require('mongoose');

const connectionDB = async (uri) => {
   try{
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch(err){
        console.error(`DB Connection Error: ${err.message}`);
        process.exit(1);
    }
}  

module.exports = connectionDB;