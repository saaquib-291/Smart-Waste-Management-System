const express = require('express');
const { Complaint, Bin } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/complaints — list with filters
router.get('/', requireAuth, async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.category) where.category = req.query.category;

    const complaints = await Complaint.findAll({
      where,
      include: [{ model: Bin, as: 'bin', attributes: ['bin_id', 'district', 'bin_type'] }],
      order: [['filled_at', 'DESC']],
    });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/complaints/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [{ model: Bin, as: 'bin' }],
    });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/complaints — file new complaint
router.post('/', requireAuth, async (req, res) => {
  try {
    const complaint = await Complaint.create(req.body);
    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/complaints/:id — update status
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    await complaint.update(req.body);
    res.json(complaint);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/complaints/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    await complaint.destroy();
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
