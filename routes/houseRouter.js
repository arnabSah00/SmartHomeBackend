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

// Get house names of a user
router.get("/house", isAuthenticated, async (req, res) => {
    const { contact } = req.query;

    if (!contact) {
        return res.status(400).json({ message: 'Invalid request: contact is required' });
    }

    try {
        const user = await User.findOne({ userid: contact });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const houseNames = user.homes.map(home => home.name);
        res.status(200).json({ houses: houseNames });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add house
router.post("/house/add", isAuthenticated, async (req, res) => {
    const { contact, houseName } = req.body;

    if (!contact || !houseName) {
        return res.status(400).json({ message: 'Invalid request: contact and house name are required' });
    }

    try {
        const user = await User.findOne({ userid: contact });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingHouse = user.homes.find(h => h.name === houseName);
        if (existingHouse) {
            return res.status(400).json({ message: 'House name already exists' });
        }

        const newHouse = { name: houseName, rooms: [] };
        user.homes.push(newHouse);
        await user.save();

        res.status(200).json({ message: 'House added successfully', houses: user.homes.map(home => home.name) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Edit house
router.put("/house/edit", isAuthenticated, async (req, res) => {
    const { contact, oldHouseName, newHouseName } = req.body;

    if (!contact || !oldHouseName || !newHouseName) {
        return res.status(400).json({ message: 'Invalid request: contact, old house name, and new house name are required' });
    }

    try {
        const user = await User.findOne({ userid: contact });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const house = user.homes.find(h => h.name === oldHouseName);
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }

        const existingHouse = user.homes.find(h => h.name === newHouseName);
        if (existingHouse) {
            return res.status(400).json({ message: 'House name already exists' });
        }

        house.name = newHouseName;
        await user.save();

        res.status(200).json({ message: 'House edited successfully', houses: user.homes.map(home => home.name) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete house
// Delete house
router.delete("/house/delete", isAuthenticated, async (req, res) => {
    const { contact, houseName } = req.body;

    if (!contact || !houseName) {
        return res.status(400).json({ message: 'Invalid request: contact and house name are required' });
    }

    try {
        const user = await User.findOne({ userid: contact });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const houseIndex = user.homes.findIndex(h => h.name === houseName);
        if (houseIndex === -1) {
            return res.status(404).json({ message: 'House not found' });
        }

        user.homes.splice(houseIndex, 1);

        // If no houses are left, add "My home"
        if (user.homes.length === 0) {
            user.homes.push({ name: "My home" });
        }

        await user.save();

        res.status(200).json({ message: 'House deleted successfully', houses: user.homes.map(home => home.name) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
