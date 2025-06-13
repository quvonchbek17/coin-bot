const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
  id: String,
  username: String,
  first_name: String,
  last_name: String,
  coins: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  levelCoins: { type: Number, default: 0 },
  totalTaps: { type: Number, default: 0 },
  energy: { type: Number, default: 1000 },
  energyCapacity: { type: Number, default: 1000 },
  clickQuality: { type: Number, default: 1 },
  energyQuality: { type: Number, default: 1 },
  lastClickDate: { type: Date, default: new Date() },
  lastCalculatedEnergyDate: { type: Date, default: new Date() },
  refCode: String,
  lastActiveDate: Date,
  todayActiveMilliSeconds: Number,
  referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }]
}, { timestamps: true });

module.exports = mongoose.model('Users', UsersSchema);
