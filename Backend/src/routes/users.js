const express = require('express');
const router = express.Router();
const { getAllDoctors } = require('../controllers/users');
const { checkAuth, restrictTo } = require('../middlewares/authMiddleware');

router.get('/doctors', checkAuth, restrictTo(['patient']), getAllDoctors);

module.exports = router;