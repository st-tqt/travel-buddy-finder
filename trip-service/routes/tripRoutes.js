const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

console.log('CONTROLLER:', tripController);

router.get('/', tripController.getTrips);
router.get('/:id', tripController.getTripById);
router.post('/', tripController.createTrip);
router.put('/:id', tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);

module.exports = router;