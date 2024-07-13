// routes/signoutRoute.js
const express = require('express');
const router = express.Router();

// Route to handle user sign out
router.get("/signout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to sign out' });
    }
    res.status(200).json({ message: 'Sign out successful' });
  });
});

module.exports = router;