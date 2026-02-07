const mongoose = require('mongoose');

const LandSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String },
    area: { type: Number },
    location: { type: String },
    soilType: { type: String },
    status: { type: String },
});

module.exports = mongoose.model('Land', LandSchema);
