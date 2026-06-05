const express = require('express');
const { CollectionLog, CollectionRoute, Vehicle, Driver } = require('../models');
const { Op } = require('sequelize');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/collection-logs — list logs with date filters
router.get('/', requireAuth, async (req, res) => {
  try {
    const where = {};
    if (req.query.from && req.query.to) {
      where.collection_date = {
        [Op.between]: [req.query.from, req.query.to],
      };
    } else if (req.query.from) {
      where.collection_date = { [Op.gte]: req.query.from };
    } else if (req.query.to) {
      where.collection_date = { [Op.lte]: req.query.to };
    }
    if (req.query.driver_id) where.driver_id = req.query.driver_id;
    if (req.query.vehicle_id) where.vehicle_id = req.query.vehicle_id;

    const logs = await CollectionLog.findAll({
      where,
      include: [
        { model: CollectionRoute, as: 'route', attributes: ['route_name'] },
        { model: Vehicle, as: 'vehicle', attributes: ['plate_number', 'type'] },
        { model: Driver, as: 'driver', attributes: ['full_name'] },
      ],
      order: [['collection_date', 'DESC']],
      limit: 200,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collection-logs — create log
router.post('/', requireAuth, async (req, res) => {
  try {
    const log = await CollectionLog.create(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/collection-logs/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const log = await CollectionLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    await log.destroy();
    res.json({ message: 'Log deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
