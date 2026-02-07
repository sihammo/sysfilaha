const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cropName: { type: String, required: true },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    totalPrice: { type: Number },
    buyerName: { type: String },
    saleDate: { type: Date, default: Date.now },
    paymentStatus: { type: String, enum: ['paid', 'pending', 'unpaid'], default: 'pending' },
});

module.exports = mongoose.model('Sale', SaleSchema);
