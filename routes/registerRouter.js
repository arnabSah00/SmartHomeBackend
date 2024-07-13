// routes/userRoutes.js
const express = require("express");
const bcrypt=require("bcrypt");
const user = require("../models/userModel");

const router = express.Router();
const saltRound=10;
let verifyRegister=false;

// Route to save a new user
router.post("/register", async (req, res) => {
  const { username, contact, password, rememberUser } = req.body;

  try {
    // Check if a user with the given userid (contact) already exists
    const existingUser = await user.findOne({ userid: contact });
    if (existingUser) {
      return res.status(400).json({ error: "User with this contact already exists" });
    }

    // Password hashing
    bcrypt.hash(password, saltRound, async (err, hash) => {
      if (err) {
        res.status(400).send(err);
      } else {
        // Process the data (e.g., save to database)
        const newUser = new user({
          userid: contact,
          username: username,
          password: hash,
        });
        console.log("newUser=", newUser);

        const savedUser = await newUser.save();
        console.log(savedUser);

        if (savedUser) {
          if (rememberUser) {
            req.logIn(savedUser, (err) => { // Log the user in
              if (err) {
                return res.status(500).json({ error: 'Failed to log in after registration' });
              }
              return res.status(201).json({ message: 'Registration and login successful', user: savedUser });
            });
          } else {
            return res.status(201).json({ message: 'Registration successful', user: savedUser });
          }
        } else {
          res.status(500).json({ error: 'Registration failed' });
        }
      }
    });
  } catch (err) {
    res.status(400).send(err);
  }
});



module.exports = router;
