const express = require('express');
const { Driver } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/drivers
router.get('/', requireAuth, async (req, res) => {
  try {
    const drivers = await Driver.findAll({ order: [['driver_id', 'ASC']] });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drivers/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drivers
router.post('/', requireAuth, async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/drivers/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    await driver.update(req.body);
    res.json(driver);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/drivers/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    await driver.destroy();
    res.json({ message: 'Driver deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
