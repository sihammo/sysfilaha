const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    type: { type: String, default: 'financial' },
    content: { type: String },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', ReportSchema);
