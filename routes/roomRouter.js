// routes/protectedRoute.js
const express = require('express');
const router = express.Router();
const User = require("../models/userModel"); // Adjust the path as needed

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'You need to be signed in to access this resource' });
}

// Get room of a house
router.get("/house/:houseName/room", isAuthenticated, async (req, res) => {
    const { contact } = req.query; // Assuming contact is passed as a query parameter
    const { houseName } = req.params;

    if (!contact || !houseName) {
        return res.status(400).json({ message: 'Invalid request: contact and house name are required' });
    }

    try {
        const user = await User.findOne({ userid:contact });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const house = user.homes.find(h => h.name === houseName);
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }

        const roomNames = house.rooms.map(room => room.name);
        res.status(200).json({ rooms: roomNames });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add room
router.post("/house/:houseName/room/add", isAuthenticated, async (req, res) => {
    const { contact, roomName } = req.body;
    const { houseName } = req.params;

    if (!contact || !houseName || !roomName) {
        return res.status(400).json({ message: 'Invalid request: contact, house name, and room name are required' });
    }

    try {
        const user = await User.findOne({ userid:contact });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const house = user.homes.find(h => h.name === houseName);
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }

        if (house.rooms.some(room => room.name === roomName)) {
            return res.status(400).json({ message: 'Room exist within the house' });
        }

        const newRoom = { name: roomName, devices: [] };
        house.rooms.push(newRoom);
        await user.save();

        res.status(200).json({ message: 'Room added successfully', house });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Edit room
router.put("/house/:houseName/room/edit", isAuthenticated, async (req, res) => {
    const { contact, oldRoomName, newRoomName } = req.body;
    const { houseName } = req.params;

    if (!contact || !houseName || !oldRoomName || !newRoomName) {
        return res.status(400).json({ message: 'Invalid request: contact, house name, old room name, and new room name are required' });
    }

    try {
        const user = await User.findOne({ userid:contact });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const house = user.homes.find(h => h.name === houseName);
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }

        if (house.rooms.some(room => room.name === newRoomName && room.name !== oldRoomName)) {
            return res.status(400).json({ message: 'Room exist within the house' });
        }

        const room = house.rooms.find(r => r.name === oldRoomName);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        room.name = newRoomName;
        await user.save();

        res.status(200).json({ message: 'Room edited successfully', house });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete room
router.delete("/house/:houseName/room/delete", isAuthenticated, async (req, res) => {
    const { contact, roomName } = req.body;
    const { houseName } = req.params;

    if (!contact || !houseName || !roomName) {
        return res.status(400).json({ message: 'Invalid request: contact, house name, and room name are required' });
    }

    try {
        const user = await User.findOne({ userid:contact });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const house = user.homes.find(h => h.name === houseName);
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }

        const roomIndex = house.rooms.findIndex(r => r.name === roomName);
        if (roomIndex === -1) {
            return res.status(404).json({ message: 'Room not found' });
        }

        house.rooms.splice(roomIndex, 1);
        await user.save();

        res.status(200).json({ message: 'Room deleted successfully', house });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
