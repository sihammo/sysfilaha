const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Land = require('../models/Land');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
    const { firstName, lastName, nationalId, farmerCardNumber, password, phone, email, address, landArea, region, crops, coordinates } = req.body;

    try {
        let user = await User.findOne({ nationalId });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            firstName,
            lastName,
            nationalId,
            farmerCardNumber,
            password,
            role: 'farmer',
            status: 'pending',
            phone,
            email,
            address,
            landArea,
            region,
            crops
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Create Land if coordinates exist
        if (coordinates && Array.isArray(coordinates) && coordinates.length > 2) {
            const newLand = new Land({
                user: user._id,
                name: `أرض ${user.firstName}`,
                area: parseFloat(landArea) || 0,
                location: user.address || user.region || 'غير محدد',
                coordinates: coordinates
            });
            await newLand.save();
            console.log(`Land created for user ${user._id} with ${coordinates.length} points`);
        }

        res.json({ msg: 'Registration successful, pending approval', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { nationalId, password } = req.body;

    try {
        let user = await User.findOne({ nationalId });

        // For admin, nationalId might be different or we use a special check
        if (!user && nationalId === 'admin') {
            user = await User.findOne({ role: 'admin' });
        }

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch && password !== 'admin') { // Temporary check for demo admin
            if (password !== user.password) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }
        }

        if (user.role === 'farmer' && user.status !== 'approved') {
            return res.status(403).json({ msg: 'Your account is not approved yet' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token, user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        region: user.region,
                        landArea: user.landArea,
                        address: user.address
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/stats
// @desc    Get public statistics for landing page
// @access  Public
router.get('/stats', async (req, res) => {
    try {
        const totalFarmers = await User.countDocuments({ role: 'farmer', status: 'approved' });

        // Get only approved farmers' IDs
        const approvedFarmers = await User.find({ role: 'farmer', status: 'approved' }).select('_id');
        const approvedFarmerIds = approvedFarmers.map(f => f._id);

        // Get lands only for approved farmers
        const allLands = await Land.find({ user: { $in: approvedFarmerIds } });
        const totalArea = allLands.reduce((sum, l) => sum + (l.area || 0), 0);

        res.json({
            totalFarmers,
            totalArea
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
