import axios from 'axios';

// Auth is carried by an httpOnly cookie set by the backend on login.
// withCredentials makes the browser send/receive that cookie cross-origin.
// No token is stored in JS — nothing to attach manually.
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    withCredentials: true,
})

export default api;
