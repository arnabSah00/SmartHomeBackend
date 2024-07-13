// routes/protectedRoute.js
const express = require('express');
const router = express.Router();

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'You need to be signed in to access this resource' });
}

// Example of a protected route
router.get("/", isAuthenticated, (req, res) => {
  res.status(200).json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
