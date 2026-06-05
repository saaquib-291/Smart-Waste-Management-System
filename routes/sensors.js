const express = require('express');
const { SensorReading, Bin } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/sensors — all recent readings
router.get('/', requireAuth, async (req, res) => {
  try {
    const readings = await SensorReading.findAll({
      include: [{ model: Bin, as: 'bin', attributes: ['bin_id', 'district', 'bin_type'] }],
      order: [['recorded_at', 'DESC']],
      limit: 100,
    });
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sensors — record new reading
router.post('/', requireAuth, async (req, res) => {
  try {
    const reading = await SensorReading.create(req.body);
    res.status(201).json(reading);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
