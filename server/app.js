// =================================================================
// 1. IMPORTS
// =================================================================
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/authMiddleware');

// =================================================================
// 2. CONFIGURATION & INITIALIZATION
// =================================================================
const PORT = process.env.PORT || 3001; // Use Render's port if available
const JWT_SECRET = process.env.JWT_SECRET;

// --- DATABASE CONNECTION ---
// This configuration is critical for Render's environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // This is required for connecting to Render's database from a Render service
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize the Express App
const app = express();

// =================================================================
// 3. MIDDLEWARE
// =================================================================
app.use(cors());
app.use(express.json());

// =================================================================
// 4. API ROUTES
// =================================================================

// --- HEALTH CHECK ROUTE (for debugging) ---
app.get('/api/health-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM vendors');
    res.json({ status: 'ok', vendor_count: result.rows[0].count });
  } catch (err) {
    res.status(500).json({ status: 'error', error_message: err.message });
  }
});

// --- ALL YOUR OTHER ROUTES ---
// (The rest of your app.get and app.post routes for vendors, items, auth, orders go here)
// ...

// =================================================================
// 5. START SERVER
// =================================================================
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

module.exports = { app, pool };
