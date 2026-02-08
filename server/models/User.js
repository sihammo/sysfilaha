const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    nationalId: { type: String },
    farmerCardNumber: { type: String },
    role: { type: String, enum: ['admin', 'farmer'], default: 'farmer' },
    password: { type: String, required: true },
    approved: { type: Boolean, default: false },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    landArea: { type: String },
    region: { type: String },
    crops: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    registrationDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
