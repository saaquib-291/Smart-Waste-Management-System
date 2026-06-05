const express = require('express');
const { CollectionRoute, Bin, RouteBin, CollectionLog } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/routes — list all collection routes
router.get('/', requireAuth, async (req, res) => {
  try {
    const routes = await CollectionRoute.findAll({
      include: [{ model: Bin, as: 'bins', attributes: ['bin_id', 'district'], through: { attributes: [] } }],
      order: [['route_id', 'ASC']],
    });
    const result = routes.map((r) => ({
      ...r.toJSON(),
      bin_count: r.bins ? r.bins.length : 0,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/routes/:id — route detail with assigned bins
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const route = await CollectionRoute.findByPk(req.params.id, {
      include: [{ model: Bin, as: 'bins', through: { attributes: [] } }],
    });
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/routes — create route
router.post('/', requireAuth, async (req, res) => {
  try {
    const route = await CollectionRoute.create(req.body);
    res.status(201).json(route);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/routes/:id — update route
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const route = await CollectionRoute.findByPk(req.params.id);
    if (!route) return res.status(404).json({ error: 'Route not found' });
    await route.update(req.body);
    res.json(route);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/routes/:id/bins — assign bins to route
router.post('/:id/bins', requireAuth, async (req, res) => {
  try {
    const { bin_ids } = req.body; // Array of bin_id values
    if (!Array.isArray(bin_ids)) {
      return res.status(400).json({ error: 'bin_ids must be an array' });
    }
    // Remove existing assignments
    await RouteBin.destroy({ where: { route_id: req.params.id } });
    // Create new assignments
    const assignments = bin_ids.map((bin_id) => ({
      route_id: parseInt(req.params.id),
      bin_id,
    }));
    await RouteBin.bulkCreate(assignments);
    res.json({ message: 'Bins assigned to route', count: assignments.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/routes/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const route = await CollectionRoute.findByPk(req.params.id);
    if (!route) return res.status(404).json({ error: 'Route not found' });
    await RouteBin.destroy({ where: { route_id: req.params.id } });
    await route.destroy();
    res.json({ message: 'Route deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
