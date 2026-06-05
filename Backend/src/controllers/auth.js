const User = require('../models/user');
const bcrypt = require('bcrypt');
const { setUser } = require('../service/auth');

exports.registerUser = async (req, res) => {
    try {

    const { name, email, password, role, age, specialization } = req.body;
    if(!name || !email || !password){
        return res.status(400).json({ message: 'All fields required' });
    }
    const existing = await User.findOne({ email })

    if(existing){
        return res.status(400).json({ message: 'User already exists' });
    }

    // Public signup may only create patients or doctors. Never admin.
    const safeRole = role === 'doctor' ? 'doctor' : 'patient';

    const hashedPassword = await bcrypt.hash(password, 10);
    const status = safeRole === 'doctor' ? 'pending' : 'approved';
    const user = await User.create({ name, email, password: hashedPassword, age, role: safeRole, specialization, status })

    const safeUser = user.toObject();
    delete safeUser.password;

    const message = safeRole === 'doctor'
        ? 'Doctor account created. Awaiting admin approval.'
        : 'User created';

    return res.status(201).json({
        success: true, message,
        user: safeUser
    })

    } catch(err) {
        res.status(500).json({ message: err.message });
    }
}

exports.loginUser = async (req, res) => {
    try{

        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({message: 'All fields are required'})
        }

        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({message: 'Email not found'})
        }

        const matchPass = await bcrypt.compare(password, user.password)
        if(!matchPass){
            return res.status(400).json({message: 'Password is incorrect'});
        }

        if(user.role === 'doctor' && user.status === 'pending'){
            return res.status(403).json({ message: 'Account pending admin approval.' });
        }
        if(user.status === 'rejected'){
            return res.status(403).json({ message: 'Account request rejected.' });
        }

        const token = await setUser(user);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const safeUser = user.toObject();
        delete safeUser.password;

        // JWT lives only in the httpOnly cookie — never sent in the body / readable by JS.
        res.status(200).json({ message: 'Login Successful', user: safeUser });

    } catch(err){
        res.status(500).json({ message: err.message });
    }
}

exports.logoutUser = async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.status(200).json({ message: 'Logged out' });
}