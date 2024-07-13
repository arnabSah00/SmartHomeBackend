// routes/protectedRoute.js
const express = require('express');
const router = express.Router();
const User = require("../models/userModel");

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'You need to be signed in to access this resource' });
}

// Route to send the whole data of a home to the frontend
router.get("/user/home-data", isAuthenticated, async (req, res) => {
    const { contact, houseName } = req.query;

    if (!contact || !houseName) {
        return res.status(400).json({ message: 'Invalid request: contact and house name are required' });
    }

    try {
        const user = await User.findOne({ userid: contact });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const house = user.homes.find(h => h.name === houseName);
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }

        res.status(200).json({ house });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to save the whole data of a home to the database
router.post("/user/save-home-data", isAuthenticated, async (req, res) => {
    const { contact, houseData } = req.body;

    if (!contact || !houseData || !houseData.name) {
        return res.status(400).json({ message: 'Invalid request: contact and house data with a name are required' });
    }

    try {
        const user = await User.findOne({ userid: contact });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingHouseIndex = user.homes.findIndex(h => h.name === houseData.name);
        if (existingHouseIndex !== -1) {
            // Update existing house
            user.homes[existingHouseIndex] = houseData;
        } else {
            // Add new house
            user.homes.push(houseData);
        }

        await user.save();

        res.status(200).json({ message: 'House data saved successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;