const express = require('express');
const { Zone, Bin } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/zones — list all zones with bin count
router.get('/', requireAuth, async (req, res) => {
  try {
    const zones = await Zone.findAll({
      include: [{ model: Bin, as: 'bins', attributes: ['bin_id'] }],
      order: [['zone_id', 'ASC']],
    });
    const result = zones.map((z) => ({
      ...z.toJSON(),
      bin_count: z.bins ? z.bins.length : 0,
      bins: undefined,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/zones/:id — zone detail with bins
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const zone = await Zone.findByPk(req.params.id, {
      include: [{ model: Bin, as: 'bins' }],
    });
    if (!zone) return res.status(404).json({ error: 'Zone not found' });
    res.json(zone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/zones — create zone
router.post('/', requireAuth, async (req, res) => {
  try {
    const zone = await Zone.create(req.body);
    res.status(201).json(zone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/zones/:id — update zone
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const zone = await Zone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ error: 'Zone not found' });
    await zone.update(req.body);
    res.json(zone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/zones/:id — delete zone
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const zone = await Zone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ error: 'Zone not found' });
    await zone.destroy();
    res.json({ message: 'Zone deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
