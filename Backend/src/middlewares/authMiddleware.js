const jwt = require('jsonwebtoken');
const { getUser } = require('../service/auth');

const checkAuth = (req, res, next) => {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = getUser(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Token is not valid' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }   
};

const restrictTo = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {   
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

module.exports = {  checkAuth, restrictTo };