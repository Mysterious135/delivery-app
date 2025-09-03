// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-super-secret-key-that-should-be-in-an-env-file';

module.exports = function(req, res, next) {
  // Get token from the header
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer TOKEN

  // Check if not token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user; // Add user payload to the request object
    next(); // Move on to the next piece of middleware or the route handler
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};