const express = require('express');
const router = express.Router();
const { getMyAvailability, upsertMyAvailability } = require('../controllers/availability');
const { checkAuth, restrictTo } = require('../middlewares/authMiddleware');

router.get('/me', checkAuth, restrictTo(['doctor']), getMyAvailability);

router.put('/me', checkAuth, restrictTo(['doctor']), upsertMyAvailability);

module.exports = router;
