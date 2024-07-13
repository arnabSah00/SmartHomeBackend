const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historySchema = new Schema({
  device: { type: String, required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: 'user', required: true }
});

module.exports = mongoose.model('History', historySchema);