require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');

(async () => {
    try {
        const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

        if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
            console.error('Missing required env vars: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME');
            process.exit(1);
        }

        await mongoose.connect(MONGO_URI);

        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            console.log('Admin already exists');
            await mongoose.disconnect();
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            age: 30,
            role: 'admin',
            status: 'approved'
        });

        console.log(`Admin created successfully: ${ADMIN_EMAIL}`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error(`Error creating admin: ${err.message}`);
        process.exit(1);
    }
})();
