const tripModel = require('../models/tripModel');

console.log('TRIPMODEL FUNCTIONS:', Object.keys(tripModel));

const getTrips = async (req, res) => {
  try {
    const { location, tags, startDate, endDate } = req.query;
    if (location || tags || startDate || endDate) {
      const data = await tripModel.searchTrips(req.query);
      return res.json(data);
    }
    const data = await tripModel.getAllTrips();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTripById = async (req, res) => {
  try {
    const trip = await tripModel.getTripById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Khong tim thay trip' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createTrip = async (req, res) => {
  try {
    const tripId = await tripModel.createTrip(req.body);
    res.status(201).json({ message: 'Tao trip thanh cong', tripId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTrip = async (req, res) => {
  try {
    const trip = await tripModel.getTripById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Khong tim thay trip' });
    await tripModel.updateTrip(req.params.id, req.body);
    res.json({ message: 'Cap nhat trip thanh cong' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteTrip = async (req, res) => {
  try {
    const trip = await tripModel.getTripById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Khong tim thay trip' });
    await tripModel.deleteTrip(req.params.id);
    res.json({ message: 'Xoa trip thanh cong' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getTrips, getTripById, createTrip, updateTrip, deleteTrip };