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

// Single source for the auth-cookie options.
// In production FE (Vercel) and BE (Render) live on different domains, so the
// cookie is cross-site: it MUST be sameSite 'none' + secure (https) to be sent.
// Locally we use 'lax' over http. Pass includeMaxAge:false for clearCookie.
const getCookieOptions = ({ includeMaxAge = true } = {}) => {
    const isProd = process.env.NODE_ENV === 'production';
    const options = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
    };
    if (includeMaxAge) options.maxAge = 7 * 24 * 60 * 60 * 1000;
    return options;
}

module.exports = { setUser, getUser, getCookieOptions };