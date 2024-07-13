const express = require('express');
const router = express.Router();
const History = require('../models/History');

// Middleware to check authentication
const checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Fetch history data
router.get('/', checkAuth, async (req, res) => {
  try {
    const history = await History.find({ user: req.user._id }).sort({ timestamp: -1 });
    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error });
  }
});

module.exports = router;