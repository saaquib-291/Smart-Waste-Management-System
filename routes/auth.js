const express = require('express');
const bcrypt = require('bcrypt');
const { Admin } = require('../models');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    req.session.admin = {
      admin_id: admin.admin_id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    };

    res.json({ message: 'Login successful', admin: req.session.admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (req.session && req.session.admin) {
    return res.json({ admin: req.session.admin });
  }
  res.status(401).json({ error: 'Not authenticated' });
});

module.exports = router;
