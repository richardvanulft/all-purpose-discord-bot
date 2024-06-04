const mongoose = require('mongoose');

const WarningSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  issuerId: String,
  reason: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Warning', WarningSchema);