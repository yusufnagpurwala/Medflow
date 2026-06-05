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

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, age, role, specialization })

    return res.status(201).json({ 
        success: true, message: 'User created',
        user: user 
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
        const token = await setUser(user);
        res.cookie('token', token); 
        res.status(200).json({ message: 'Login Successful', token: token, user: user });
        
    } catch(err){
        res.status(500).json({ message: err.message });
    }
}