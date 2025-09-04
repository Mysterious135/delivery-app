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
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();

// =================================================================
// 3. MIDDLEWARE
// =================================================================
app.use(cors());
app.use(express.json());

// =================================================================
// 4. API ROUTES
// =================================================================

// --- HEALTH CHECK ROUTE ---
app.get('/api/health-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM vendors');
    res.json({ status: 'ok', vendor_count: result.rows[0].count });
  } catch (err) {
    res.status(500).json({ status: 'error', error_message: err.message });
  }
});

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const newUser = await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email', [email, password_hash]);
        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        if (err.code === '23505') { return res.status(400).json({ message: 'Email already in use.' }); }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) { return res.status(400).json({ message: 'Email and password are required.' }); }
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) { return res.status(400).json({ message: 'Invalid credentials.' }); }
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) { return res.status(400).json({ message: 'Invalid credentials.' }); }
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
app.post('/api/orders', authMiddleware, async (req, res) => {
    const { items, paymentMethod } = req.body;
    const userId = req.user.id;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const orderResult = await client.query(`INSERT INTO orders (status, payment_method, user_id) VALUES ($1, $2, $3) RETURNING id`, ['Confirmed', paymentMethod, userId]);
        const orderId = orderResult.rows[0].id;
        for (const item of items) {
            const stockCheck = await client.query('SELECT stock_quantity FROM items WHERE id = $1 FOR UPDATE', [item.itemId]);
            if (stockCheck.rows[0].stock_quantity < item.quantity) { throw new Error(`Not enough stock for item ${item.itemId}`); }
            await client.query('UPDATE items SET stock_quantity = stock_quantity - $1 WHERE id = $2', [item.quantity, item.itemId]);
            await client.query('INSERT INTO order_items (order_id, item_id, quantity) VALUES ($1, $2, $3)', [orderId, item.itemId, item.quantity]);
        }
        await client.query('COMMIT');
        res.status(201).json({ message: 'Order created successfully!', orderId });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
        res.status(500).json({ message: 'Failed to create order.' });
    } finally {
        client.release();
    }
});


// =================================================================
// 5. START SERVER
// =================================================================
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

module.exports = { app, pool };

