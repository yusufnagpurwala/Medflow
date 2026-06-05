require('dotenv').config();
const jwt = require('jsonwebtoken');

const setUser = async (user) => {
    return jwt.sign({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    }, process.env.JWT_SECRET, { expiresIn: '7d'})
}

const getUser = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch(err) {
        return null;
    }   
}

module.exports = { setUser, getUser };