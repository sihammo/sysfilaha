require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect to Database
connectDB().then(async () => {
    // Seed admin if not exists
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin', salt);
        const admin = new User({
            firstName: 'المسؤول',
            lastName: 'العام',
            nationalId: 'admin',
            password: hashedPassword,
            role: 'admin',
            approved: true,
            status: 'approved'
        });
        await admin.save();
        console.log('Default Admin created: admin/admin');
    }
});

// Middleware
app.use(express.json());
app.use(cors());

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/farmer', require('./routes/farmerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Serve Static Assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    // Note: The 'dist' folder will be located in the root directory relative to the server folder
    app.use(express.static(path.join(__dirname, '../dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
