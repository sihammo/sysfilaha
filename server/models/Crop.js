const mongoose = require('mongoose');

const FarmerDataSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String },
    area: { type: Number },
    plantingDate: { type: Date },
    harvestDate: { type: Date },
    status: { type: String }, // e.g., 'planted', 'harvested', 'growing'
    expectedYield: { type: Number },
});

module.exports = mongoose.model('Crop', FarmerDataSchema);
