// models/User.js

const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    details:{ type: String },
    favourite: { type: Boolean, default: false },
    status: { type: Boolean, default: false },
}, { _id: false });
  
const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    devices: [deviceSchema]
}, { _id: false });
  
const homeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rooms: { type: [roomSchema], default: [{name:"Living room"}] }
}, { _id: false });

const userSchema = new mongoose.Schema({
    userid: { type: String, required: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    homes: { type: [homeSchema], default: [{name:"My home"}] }
}, { collection: 'user' });

module.exports = mongoose.model('user', userSchema);
