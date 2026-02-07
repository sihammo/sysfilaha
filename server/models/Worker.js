const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    role: { type: String },
    phone: { type: String },
    salary: { type: Number },
    startDate: { type: Date },
});

module.exports = mongoose.model('Worker', WorkerSchema);
