const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String },
    purchaseDate: { type: Date },
    condition: { type: String },
    maintenanceDate: { type: Date },
});

module.exports = mongoose.model('Equipment', EquipmentSchema);
