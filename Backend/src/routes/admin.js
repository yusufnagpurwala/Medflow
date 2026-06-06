const express = require('express');
const router = express.Router();
const {
    getPendingDoctors,
    approveDoctor,
    rejectDoctor,
    getStats,
    getAllUsers,
    getAllDoctors,
    getAllPatients,
    getAllAppointments,
    getAnalytics
} = require('../controllers/admin');
const { getDoctorAvailability, upsertDoctorAvailability } = require('../controllers/availability');
const { checkAuth, restrictTo } = require('../middlewares/authMiddleware');

router.get('/doctors/pending', checkAuth, restrictTo(['admin']), getPendingDoctors);
router.get('/doctors/:id/availability', checkAuth, restrictTo(['admin']), getDoctorAvailability);
router.put('/doctors/:id/availability', checkAuth, restrictTo(['admin']), upsertDoctorAvailability);
router.patch('/doctors/:id/approve', checkAuth, restrictTo(['admin']), approveDoctor);
router.patch('/doctors/:id/reject', checkAuth, restrictTo(['admin']), rejectDoctor);
router.get('/doctors', checkAuth, restrictTo(['admin']), getAllDoctors);
router.get('/patients', checkAuth, restrictTo(['admin']), getAllPatients);
router.get('/appointments', checkAuth, restrictTo(['admin']), getAllAppointments);
router.get('/stats', checkAuth, restrictTo(['admin']), getStats);
router.get('/analytics', checkAuth, restrictTo(['admin']), getAnalytics);
router.get('/users', checkAuth, restrictTo(['admin']), getAllUsers);

module.exports = router;
