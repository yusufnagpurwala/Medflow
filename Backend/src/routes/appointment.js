const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, getAppointmentById, updateAppointmentStatus, addNotes, getDoctorAnalytics } = require('../controllers/appointment');
const { checkAuth, restrictTo } = require('../middlewares/authMiddleware');

router.post('/create-appointment', checkAuth, restrictTo(['patient']), createAppointment);

router.get('/', checkAuth, getAppointments);

router.get('/analytics', checkAuth, restrictTo(['doctor']), getDoctorAnalytics);

router.get('/:id', checkAuth, getAppointmentById);

router.patch('/:id/status', checkAuth, restrictTo(['doctor']), updateAppointmentStatus);

router.patch('/:id/notes', checkAuth, restrictTo(['doctor']), addNotes);

module.exports = router;