const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Crop = require('../models/Crop');
const Sale = require('../models/Sale');
const Land = require('../models/Land');
const Equipment = require('../models/Equipment');
const Livestock = require('../models/Livestock');
const Worker = require('../models/Worker');

// @route   GET api/farmer/stats
// @desc    Get farmer statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
    try {
        const cropsCount = await Crop.countDocuments({ user: req.user.id });
        const sales = await Sale.find({ user: req.user.id });
        const landsCount = await Land.countDocuments({ user: req.user.id });
        const equipmentCount = await Equipment.countDocuments({ user: req.user.id });
        const livestockCount = await Livestock.countDocuments({ user: req.user.id });

        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);

        res.json({
            totalCrops: cropsCount,
            totalSales: sales.length,
            totalResources: landsCount + equipmentCount + livestockCount,
            monthlyRevenue: totalRevenue,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// CROPS CRUD
router.get('/crops', auth, async (req, res) => {
    try {
        const crops = await Crop.find({ user: req.user.id });
        res.json(crops);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.post('/crops', auth, async (req, res) => {
    try {
        const newCrop = new Crop({ ...req.body, user: req.user.id });
        const crop = await newCrop.save();
        res.json(crop);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.put('/crops/:id', auth, async (req, res) => {
    try {
        const crop = await Crop.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $set: req.body },
            { new: true }
        );
        if (!crop) return res.status(404).json({ msg: 'Crop not found' });
        res.json(crop);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.delete('/crops/:id', auth, async (req, res) => {
    try {
        const crop = await Crop.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!crop) return res.status(404).json({ msg: 'Crop not found' });
        res.json({ msg: 'Crop removed' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// SALES CRUD
router.get('/sales', auth, async (req, res) => {
    try {
        const sales = await Sale.find({ user: req.user.id });
        res.json(sales);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.post('/sales', auth, async (req, res) => {
    try {
        const newSale = new Sale({ ...req.body, user: req.user.id });
        const sale = await newSale.save();
        res.json(sale);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.put('/sales/:id', auth, async (req, res) => {
    try {
        const sale = await Sale.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $set: req.body },
            { new: true }
        );
        if (!sale) return res.status(404).json({ msg: 'Sale not found' });
        res.json(sale);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.delete('/sales/:id', auth, async (req, res) => {
    try {
        const sale = await Sale.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!sale) return res.status(404).json({ msg: 'Sale not found' });
        res.json({ msg: 'Sale removed' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// LANDS CRUD
router.get('/lands', auth, async (req, res) => {
    try {
        const lands = await Land.find({ user: req.user.id });
        res.json(lands);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.post('/lands', auth, async (req, res) => {
    try {
        const newLand = new Land({ ...req.body, user: req.user.id });
        const land = await newLand.save();
        res.json(land);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.put('/lands/:id', auth, async (req, res) => {
    try {
        const land = await Land.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $set: req.body },
            { new: true }
        );
        if (!land) return res.status(404).json({ msg: 'Land not found' });
        res.json(land);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.delete('/lands/:id', auth, async (req, res) => {
    try {
        const land = await Land.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!land) return res.status(404).json({ msg: 'Land not found' });
        res.json({ msg: 'Land removed' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// EQUIPMENT CRUD
router.get('/equipment', auth, async (req, res) => {
    try {
        const equipment = await Equipment.find({ user: req.user.id });
        res.json(equipment);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.post('/equipment', auth, async (req, res) => {
    try {
        const newEq = new Equipment({ ...req.body, user: req.user.id });
        const eq = await newEq.save();
        res.json(eq);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.put('/equipment/:id', auth, async (req, res) => {
    try {
        const eq = await Equipment.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $set: req.body },
            { new: true }
        );
        if (!eq) return res.status(404).json({ msg: 'Equipment not found' });
        res.json(eq);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.delete('/equipment/:id', auth, async (req, res) => {
    try {
        const eq = await Equipment.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!eq) return res.status(404).json({ msg: 'Equipment not found' });
        res.json({ msg: 'Equipment removed' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// LIVESTOCK CRUD
router.get('/livestock', auth, async (req, res) => {
    try {
        const livestock = await Livestock.find({ user: req.user.id });
        res.json(livestock);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.post('/livestock', auth, async (req, res) => {
    try {
        const newLv = new Livestock({ ...req.body, user: req.user.id });
        const lv = await newLv.save();
        res.json(lv);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.put('/livestock/:id', auth, async (req, res) => {
    try {
        const lv = await Livestock.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $set: req.body },
            { new: true }
        );
        if (!lv) return res.status(404).json({ msg: 'Livestock not found' });
        res.json(lv);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.delete('/livestock/:id', auth, async (req, res) => {
    try {
        const lv = await Livestock.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!lv) return res.status(404).json({ msg: 'Livestock not found' });
        res.json({ msg: 'Livestock removed' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// WORKERS CRUD
router.get('/workers', auth, async (req, res) => {
    try {
        const workers = await Worker.find({ user: req.user.id });
        res.json(workers);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.post('/workers', auth, async (req, res) => {
    try {
        const newWorker = new Worker({ ...req.body, user: req.user.id });
        const worker = await newWorker.save();
        res.json(worker);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.put('/workers/:id', auth, async (req, res) => {
    try {
        const worker = await Worker.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $set: req.body },
            { new: true }
        );
        if (!worker) return res.status(404).json({ msg: 'Worker not found' });
        res.json(worker);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.delete('/workers/:id', auth, async (req, res) => {
    try {
        const worker = await Worker.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!worker) return res.status(404).json({ msg: 'Worker not found' });
        res.json({ msg: 'Worker removed' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
