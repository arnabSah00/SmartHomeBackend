// routes/protectedRoute.js
const express = require('express');
const router = express.Router();
const User = require("../models/userModel"); // Adjust the path as needed
const History = require('../models/History');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'You need to be signed in to access this resource' });
}

//send all device for particular house
router.get("/house/:houseName/devices", isAuthenticated, async (req, res) => {
    const { contact } = req.query;
    const { houseName } = req.params;

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

        const allDevices = house.rooms.reduce((devices, room) => {
            return devices.concat(room.devices.map(device => ({
                name: device.name,
                details: device.details, // Include device details if available
                favourite: device.favourite,
                status: device.status,
                room: room.name, // Add room name for context
                // Add other details as needed
            })));
        }, []);

        res.status(200).json({ devices: allDevices });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//send device for particular house and room
router.get("/house/:houseName/room/:roomName/devices", isAuthenticated, async (req, res) => {
    const { contact } = req.query;
    const { houseName, roomName } = req.params;

    if (!contact || !houseName || !roomName) {
        return res.status(400).json({ message: 'Invalid request: contact, house name, and room name are required' });
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

        const room = house.rooms.find(r => r.name === roomName);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const roomDevices = room.devices.map(device => ({
            name: device.name,
            details: device.details, // Include device details if available
            favourite: device.favourite,
            status: device.status,
            // Add other details as needed
        }));

        res.status(200).json({ devices: roomDevices });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//send favourite device of a house
router.get("/house/:houseName/favourite-devices", isAuthenticated, async (req, res) => {
    const { contact } = req.query;
    const { houseName } = req.params;

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

        const favouriteDevices = house.rooms.reduce((devices, room) => {
            devices = devices.concat(room.devices.filter(device => device.favourite).map(device => ({
                name: device.name,
                details: device.details, // Include device details if available
                favourite: device.favourite,
                status: device.status,
                room: room.name,  // Add the room name here
                // Add other details as needed
            })));
            return devices;
        }, []);

        res.status(200).json({ houseName, favouriteDevices });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Add device including details
router.post("/house/:houseName/room/:roomName/device/add", isAuthenticated, async (req, res) => {
    const { deviceName, deviceDetails } = req.body;
    const { houseName, roomName } = req.params;
    const { contact } = req.query;

    if (!contact || !houseName || !roomName || !deviceName) {
        return res.status(400).json({ message: 'Invalid request: contact, house name, room name, and device name are required' });
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

        const room = house.rooms.find(r => r.name === roomName);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (room.devices.some(device => device.name === deviceName)) {
            return res.status(400).json({ message: 'Device name must be unique within the room' });
        }

        const newDevice = {
            name: deviceName,
            status: false,
            favourite: false,
            details: deviceDetails // Include device details in the new device object
        };

        room.devices.push(newDevice);
        await user.save();

        // Create history entry for device addition
        await History.create({
            device: deviceName,
            action: `Added to ${houseName} in ${roomName}`,
            user: req.user._id
        });

        res.status(200).json({ devices: room.devices });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Edit device name
router.put("/house/:houseName/room/:roomName/device/:oldDeviceName/edit", isAuthenticated, async (req, res) => {
    const { newDeviceName } = req.body;
    const { houseName, roomName, oldDeviceName } = req.params;
    const { contact } = req.query;

    if (!contact || !houseName || !roomName || !oldDeviceName || !newDeviceName) {
        return res.status(400).json({ message: 'Invalid request: contact, house name, room name, old device name, and new device name are required' });
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

        const room = house.rooms.find(r => r.name === roomName);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (room.devices.some(device => device.name === newDeviceName && device.name !== oldDeviceName)) {
            return res.status(400).json({ message: 'Device name must be unique within the room' });
        }

        const device = room.devices.find(d => d.name === oldDeviceName);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        device.name = newDeviceName;
        await user.save();

        res.status(200).json({ devices: room.devices });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete device
router.delete("/house/:houseName/room/:roomName/device/:deviceName/delete", isAuthenticated, async (req, res) => {
    const { houseName, roomName ,deviceName} = req.params;
    const { contact } = req.query;

    if (!contact || !houseName || !roomName || !deviceName) {
        return res.status(400).json({ message: 'Invalid request: contact, house name, room name, and device name are required' });
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

        const room = house.rooms.find(r => r.name === roomName);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const deviceIndex = room.devices.findIndex(d => d.name === deviceName);
        if (deviceIndex === -1) {
            return res.status(404).json({ message: 'Device not found' });
        }

        room.devices.splice(deviceIndex, 1);
        await user.save();

        res.status(200).json({ devices: room.devices });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to toggle favourite status of a device
router.put("/house/:houseName/room/:roomName/device/:deviceName/favourite", isAuthenticated, async (req, res) => {
    const { contact } = req.query;
    const { houseName, roomName, deviceName } = req.params;

    if (!contact || !houseName || !roomName || !deviceName) {
        return res.status(400).json({ message: 'Invalid request: contact, house name, room name, and device name are required' });
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

        const room = house.rooms.find(r => r.name === roomName);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const device = room.devices.find(d => d.name === deviceName);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        device.favourite = !device.favourite;
        await user.save();

        res.status(200).json({ message: 'Favourite status updated'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to update the status of a device
router.put("/house/:houseName/room/:roomName/device/:deviceName/status", isAuthenticated, async (req, res) => {
    const { deviceStatus } = req.body;
    const { houseName, roomName, deviceName } = req.params;
    const { contact } = req.query;

    if (!contact || !houseName || !roomName || !deviceName || typeof deviceStatus !== 'boolean') {
        return res.status(400).json({ message: 'Invalid request: contact, house name, room name, device name, and status are required' });
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

        const room = house.rooms.find(r => r.name === roomName);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const device = room.devices.find(d => d.name === deviceName);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Update device status
        device.status = deviceStatus;
        await user.save();

        // Create history entry for device status update
        await History.create({
            device: deviceName,
            action: deviceStatus ? 'Turned On' : 'Turned Off',
            user: req.user._id
        });

        res.status(200).json({ message: 'Device status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;