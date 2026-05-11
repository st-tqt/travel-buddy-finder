const express = require('express');
const router = express.Router();
const joinRequestController = require('../controllers/joinRequestController');

router.get('/', joinRequestController.getRequests);
router.get('/trip/:tripId', joinRequestController.getRequestsByTrip);
router.get('/user/:userId', joinRequestController.getRequestsByUser);
router.post('/', joinRequestController.createRequest);
router.put('/:id/approve', joinRequestController.approveRequest);
router.put('/:id/reject', joinRequestController.rejectRequest);
router.put('/:id', joinRequestController.updateStatus);

module.exports = router;