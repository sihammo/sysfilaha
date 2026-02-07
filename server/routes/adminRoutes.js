const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    next();
};

// @route   GET api/admin/farmers
// @desc    Get all farmers
// @access  Private/Admin
router.get('/farmers', [auth, adminAuth], async (req, res) => {
    try {
        const farmers = await User.find({ role: 'farmer' }).sort({ registrationDate: -1 });
        res.json(farmers);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   PUT api/admin/farmers/:id/status
// @desc    Approve or reject farmer
// @access  Private/Admin
router.put('/farmers/:id/status', [auth, adminAuth], async (req, res) => {
    try {
        const { status } = req.body;
        const farmer = await User.findById(req.params.id);

        if (!farmer) return res.status(404).json({ msg: 'Farmer not found' });

        farmer.status = status;
        farmer.approved = status === 'approved';
        await farmer.save();

        res.json(farmer);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

const Crop = require('../models/Crop');
const Sale = require('../models/Sale');
const Land = require('../models/Land');
const Equipment = require('../models/Equipment');
const Worker = require('../models/Worker');
const Livestock = require('../models/Livestock');

// @route   GET api/admin/stats
// @desc    Get overall statistics
// @access  Private/Admin
router.get('/stats', [auth, adminAuth], async (req, res) => {
    try {
        const totalFarmers = await User.countDocuments({ role: 'farmer' });
        const approvedFarmers = await User.countDocuments({ role: 'farmer', status: 'approved' });
        const pendingFarmers = await User.countDocuments({ role: 'farmer', status: 'pending' });

        const cropsCount = await Crop.countDocuments();
        const landsCount = await Land.countDocuments();
        const eqCount = await Equipment.countDocuments();

        const allSales = await Sale.find();
        const totalRevenue = allSales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);

        const allLands = await Land.find();
        const totalArea = allLands.reduce((sum, l) => sum + (l.area || 0), 0);

        res.json({
            totalFarmers,
            approvedFarmers,
            pendingFarmers,
            totalCrops: cropsCount,
            totalRevenue,
            totalLands: landsCount,
            totalArea,
            totalEquipment: eqCount
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/full-data
// @desc    Get all system data for AI analysis
// @access  Private/Admin
router.get('/full-data', [auth, adminAuth], async (req, res) => {
    try {
        const farmers = await User.find({ role: 'farmer' });
        const crops = await Crop.find().populate('user', 'firstName lastName');
        const sales = await Sale.find().populate('user', 'firstName lastName');
        const lands = await Land.find().populate('user', 'firstName lastName');
        const equipment = await Equipment.find().populate('user', 'firstName lastName');
        const workers = await Worker.find().populate('user', 'firstName lastName');
        const livestock = await Livestock.find().populate('user', 'firstName lastName');

        res.json({
            farmers,
            crops,
            sales,
            lands,
            equipment,
            workers,
            livestock
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/admin/farmers/:id
// @desc    Delete a farmer and all their data
// @access  Private/Admin
router.delete('/farmers/:id', [auth, adminAuth], async (req, res) => {
    try {
        const farmerId = req.params.id;

        // Delete all associated data
        await Promise.all([
            Crop.deleteMany({ user: farmerId }),
            Sale.deleteMany({ user: farmerId }),
            Land.deleteMany({ user: farmerId }),
            Equipment.deleteMany({ user: farmerId }),
            Worker.deleteMany({ user: farmerId }),
            Livestock.deleteMany({ user: farmerId }),
            User.findByIdAndDelete(farmerId)
        ]);

        res.json({ msg: 'Farmer and all associated data deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/farmers/:id
// @desc    Update farmer information
// @access  Private/Admin
router.put('/farmers/:id', [auth, adminAuth], async (req, res) => {
    try {
        const farmer = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).select('-password');

        if (!farmer) return res.status(404).json({ msg: 'Farmer not found' });
        res.json(farmer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
