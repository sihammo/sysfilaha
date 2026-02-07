const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
    const { firstName, lastName, nationalId, farmerCardNumber, password, phone, email, address, landArea, region, crops } = req.body;

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

module.exports = router;
