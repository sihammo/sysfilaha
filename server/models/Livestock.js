const mongoose = require('mongoose');

const LivestockSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    quantity: { type: Number, required: true },
    age: { type: String },
    health: { type: String },
    purpose: { type: String },
    productType: { type: String },
    weight: { type: String },
    unitPrice: { type: Number },
    monthlyFeedCost: { type: Number },
    notes: { type: String },
    dateAdded: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Livestock', LivestockSchema);
