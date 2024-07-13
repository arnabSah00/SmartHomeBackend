// routes/userRoutes.js
const express = require("express");
const bcrypt=require("bcrypt");
const user = require("../models/userModel");
const passport = require('passport');

const router = express.Router();



// Route to handle user sign in
router.post("/signin", (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ error: info.message });
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      return res.status(200).json({ message: 'Sign in successful', username: user.username });
    });
  })(req, res, next);
});

// Route to check if user is authenticated
router.get("/checkAuth", (req, res) => {
  if (req.isAuthenticated()) {
    // return res.status(200).json({ isAuthenticated: true, user: req.user });
    return res.status(200).json({
      isAuthenticated: true,
      user: {
          userid: req.user.userid,
          username: req.user.username
      }
  });
  } else {
    return res.status(200).json({ isAuthenticated: false,user:{userid:'',username:''} });
  }
});

module.exports = router;

