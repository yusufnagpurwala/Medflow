const express = require('express');
const router = express.Router();
const { createRecord, getRecords, getRecordById, updateRecord } = require('../controllers/records');
const { checkAuth, restrictTo } = require('../middlewares/authMiddleware');

router.post('/create-record', checkAuth, restrictTo(['doctor', 'admin']), createRecord);

router.get('/', checkAuth, getRecords);

router.get('/:appointmentId', checkAuth, getRecordById);

router.patch('/:id', checkAuth, restrictTo(['doctor', 'admin']), updateRecord);

module.exports = router;