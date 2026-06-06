require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const AuthRouter = require('./routes/auth');
const appointmentRouter = require('./routes/appointment')
const recordRouter = require('./routes/record')
const userRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const connectDB = require('./config/db');
const { checkAuth, restrictTo } = require('./middlewares/authMiddleware');
const app = express();
const PORT = 8000;

// Behind a reverse proxy (Render/Railway/etc) — required so `secure` cookies
// and req.protocol work correctly over the proxy's https termination.
app.set('trust proxy', 1);

//DB Connection
connectDB(process.env.MONGO_URI);

//middlewares
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Routes
app.get('/', (req, res) => res.json({ message: 'MedFlow backend running 🚀'}))
app.use('/api/auth', AuthRouter);
app.use(checkAuth)
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/records', recordRouter);

//Test protected route
/* app.get('/protected/route', restrictTo(['doctor']), (req, res) => {
    res.json({ message: `Hello ${req.user.role} ${req.user.email}!` });
}); */

app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));

