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
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET;
// Create a new Pool instance to connect to the database
// server/app.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render provides this
  ssl: {
    rejectUnauthorized: false // Required for Render's database connections
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

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
            [email, password_hash]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        if (err.code === '23505') { 
            return res.status(400).json({ message: 'Email already in use.' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const payload = { user: { id: user.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- VENDOR & ITEM ROUTES ---
app.get('/api/vendors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vendors');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/api/vendors/:vendorId/items', async (req, res) => {
  const { vendorId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM items WHERE vendor_id = $1', [vendorId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- ORDER ROUTE ---
// server/index.js

// Add authMiddleware here                     👇
app.post('/api/orders', authMiddleware, async (req, res) => {
    // We no longer need customerName/Address from the body,
    // as this info should be tied to the user account.
    const { items, paymentMethod } = req.body;

    // Get the user ID from the middleware
    const userId = req.user.id; 

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Update the INSERT query to include the user_id
        const orderResult = await client.query(
            `INSERT INTO orders (status, payment_method, user_id) 
             VALUES ($1, $2, $3) RETURNING id`,
            ['Confirmed', paymentMethod, userId]
        );
        const orderId = orderResult.rows[0].id;

        // The rest of the logic for processing items remains the same...
        for (const item of items) {
            // ... (no changes in here)
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Order created successfully!', orderId });

    } catch (e) {
        // ... (error handling is the same)
    } finally {
        client.release();
    }
});

// =================================================================
// 5. START SERVER
// =================================================================
module.exports = {app, pool}; // Export the app for testing