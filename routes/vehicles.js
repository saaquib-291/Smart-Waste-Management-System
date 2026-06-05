const express = require('express');
const { Vehicle } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/vehicles
router.get('/', requireAuth, async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ order: [['vehicle_id', 'ASC']] });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicles
router.post('/', requireAuth, async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/vehicles/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    await vehicle.update(req.body);
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/vehicles/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    await vehicle.destroy();
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
