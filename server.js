require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
    },
  })
);

// ── Static Files ────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ──────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/zones', require('./routes/zones'));
app.use('/api/bins', require('./routes/bins'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/sensors', require('./routes/sensors'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/collection-logs', require('./routes/collection-logs'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/drivers', require('./routes/drivers'));

// ── Fallback: Serve index.html for non-API routes ──
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// ── Start Server ────────────────────────────
async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync models (don't force in production)
    await sequelize.sync({ alter: false });
    console.log('✅ Models synchronized');

    app.listen(PORT, () => {
      console.log(`\n🚀 Smart Waste Management System`);
      console.log(`   Server running at http://localhost:${PORT}`);
      console.log(`   API available at  http://localhost:${PORT}/api\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
