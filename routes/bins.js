const express = require('express');
const { Bin, Zone, SensorReading } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/bins — list all bins with filters
router.get('/', requireAuth, async (req, res) => {
  try {
    const where = {};
    if (req.query.zone_id) where.zone_id = req.query.zone_id;
    if (req.query.status) where.status = req.query.status;
    if (req.query.bin_type) where.bin_type = req.query.bin_type;

    const bins = await Bin.findAll({
      where,
      include: [
        { model: Zone, as: 'zone', attributes: ['zone_name'] },
      ],
      order: [['bin_id', 'ASC']],
    });

    // Attach latest sensor reading for each bin
    const result = await Promise.all(
      bins.map(async (bin) => {
        const latestReading = await SensorReading.findOne({
          where: { bin_id: bin.bin_id },
          order: [['recorded_at', 'DESC']],
        });
        return {
          ...bin.toJSON(),
          latest_reading: latestReading ? latestReading.toJSON() : null,
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bins/:id — bin detail
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const bin = await Bin.findByPk(req.params.id, {
      include: [{ model: Zone, as: 'zone' }],
    });
    if (!bin) return res.status(404).json({ error: 'Bin not found' });

    const latestReading = await SensorReading.findOne({
      where: { bin_id: bin.bin_id },
      order: [['recorded_at', 'DESC']],
    });

    res.json({ ...bin.toJSON(), latest_reading: latestReading });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bins/:id/readings — sensor reading history
router.get('/:id/readings', requireAuth, async (req, res) => {
  try {
    const readings = await SensorReading.findAll({
      where: { bin_id: req.params.id },
      order: [['recorded_at', 'ASC']],
      limit: 50,
    });
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bins — create bin
router.post('/', requireAuth, async (req, res) => {
  try {
    const bin = await Bin.create(req.body);
    res.status(201).json(bin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/bins/:id — update bin
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const bin = await Bin.findByPk(req.params.id);
    if (!bin) return res.status(404).json({ error: 'Bin not found' });
    await bin.update(req.body);
    res.json(bin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/bins/:id — delete bin
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const bin = await Bin.findByPk(req.params.id);
    if (!bin) return res.status(404).json({ error: 'Bin not found' });
    await bin.destroy();
    res.json({ message: 'Bin deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
