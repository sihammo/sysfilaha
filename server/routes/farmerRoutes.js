const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Crop = require('../models/Crop');
const Sale = require('../models/Sale');
const Land = require('../models/Land');
const Equipment = require('../models/Equipment');
const Livestock = require('../models/Livestock');
const Worker = require('../models/Worker');
const Report = require('../models/Report');
const User = require('../models/User');

// GET /api/farmer/menu-stats
router.get('/menu-stats', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const [cropsCount, livestockCount, salesCount, equipmentCount, workersCount, reportsCount] = await Promise.all([
            Crop.countDocuments({ user: userId }),
            Livestock.countDocuments({ user: userId }),
            Sale.countDocuments({ user: userId }),
            Equipment.countDocuments({ user: userId }),
            Worker.countDocuments({ user: userId }),
            Report.countDocuments({ user: userId })
        ]);

        res.json({
            cropsCount,
            livestockCount,
            salesCount,
            equipmentCount,
            workersCount,
            reportsCount
        });
    } catch (err) {
        console.error('Menu stats error:', err);
        res.status(500).send('Server error');
    }
});

router.get('/stats', auth, async (req, res) => {
    try {
        const cropsCount = await Crop.countDocuments({ user: req.user.id });
        const sales = await Sale.find({ user: req.user.id });
        const landsCount = await Land.countDocuments({ user: req.user.id });
        const equipmentCount = await Equipment.countDocuments({ user: req.user.id });
        const livestockCount = await Livestock.countDocuments({ user: req.user.id });

        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);

        // Calculate real crop distribution
        const allCrops = await Crop.find({ user: req.user.id });
        const cropDistrib = {};
        allCrops.forEach(c => {
            cropDistrib[c.name] = (cropDistrib[c.name] || 0) + 1;
        });
        const cropData = Object.keys(cropDistrib).map(name => ({ name, value: cropDistrib[name] }));

        // Calculate real monthly sales (last 6 months)
        const salesData = [];
        const months = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = months[d.getMonth()];
            const monthlySales = sales.filter(s => {
                const sDate = new Date(s.date);
                return sDate.getMonth() === d.getMonth() && sDate.getFullYear() === d.getFullYear();
            }).reduce((sum, s) => sum + (s.totalPrice || 0), 0);
            salesData.push({ month: monthName, مبيعات: monthlySales });
        }

        const workersCount = await Worker.countDocuments({ user: req.user.id });
        const workers = await Worker.find({ user: req.user.id });
        const workerSalaries = workers.reduce((sum, w) => sum + (w.salary || 0), 0);

        // Calculate Costs (Annualized)
        // Assumption: Salary is monthly, Feed cost is monthly
        const livestock = await Livestock.find({ user: req.user.id });
        const livestockFeedCost = livestock.reduce((sum, l) => sum + (l.monthlyFeedCost || 0), 0);

        const monthlyOperationalCost = workerSalaries + livestockFeedCost;
        const totalAnnualCost = monthlyOperationalCost * 12;

        const netProfit = totalRevenue - totalAnnualCost; // Simple profit calculation

        res.json({
            totalCrops: cropsCount,
            totalSales: sales.length,
            totalResources: landsCount + equipmentCount + livestockCount,

            // Detailed counts
            workersCount,
            equipmentCount,
            livestockCount,
            landsCount,

            // Financials
            totalRevenue,
            totalAnnualCost,
            netProfit,
            monthlyOperationalCost,

            // Charts
            cropData: cropData.length > 0 ? cropData : [{ name: "لا يوجد", value: 1 }],
            salesData
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// CROPS CRUD
router.get('/crops', auth, async (req, res) => {
    try {
        const crops = await Crop.find({ user: req.user.id });
        res.json(crops);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/crops', auth, async (req, res) => {
    try {
        const newCrop = new Crop({ ...req.body, user: req.user.id });
        const crop = await newCrop.save();
        res.json(crop);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
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
        res.status(500).json({ msg: 'Server error' });
    }
});

router.delete('/crops/:id', auth, async (req, res) => {
    try {
        const crop = await Crop.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!crop) return res.status(404).json({ msg: 'Crop not found' });
        res.json({ msg: 'Crop removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// SALES CRUD
router.get('/sales', auth, async (req, res) => {
    try {
        const sales = await Sale.find({ user: req.user.id });
        res.json(sales);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/sales', auth, async (req, res) => {
    try {
        const newSale = new Sale({ ...req.body, user: req.user.id });
        const sale = await newSale.save();
        res.json(sale);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
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
        res.status(500).json({ msg: 'Server error' });
    }
});

router.delete('/sales/:id', auth, async (req, res) => {
    try {
        const sale = await Sale.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!sale) return res.status(404).json({ msg: 'Sale not found' });
        res.json({ msg: 'Sale removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// LANDS CRUD
router.get('/lands', auth, async (req, res) => {
    try {
        const lands = await Land.find({ user: req.user.id });
        res.json(lands);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/lands', auth, async (req, res) => {
    try {
        const newLand = new Land({ ...req.body, user: req.user.id });
        const land = await newLand.save();
        res.json(land);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
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
        res.status(500).json({ msg: 'Server error' });
    }
});

router.delete('/lands/:id', auth, async (req, res) => {
    try {
        const land = await Land.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!land) return res.status(404).json({ msg: 'Land not found' });
        res.json({ msg: 'Land removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// EQUIPMENT CRUD
router.get('/equipment', auth, async (req, res) => {
    try {
        const equipment = await Equipment.find({ user: req.user.id });
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/equipment', auth, async (req, res) => {
    try {
        const newEq = new Equipment({ ...req.body, user: req.user.id });
        const eq = await newEq.save();
        res.json(eq);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
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
        res.status(500).json({ msg: 'Server error' });
    }
});

router.delete('/equipment/:id', auth, async (req, res) => {
    try {
        const eq = await Equipment.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!eq) return res.status(404).json({ msg: 'Equipment not found' });
        res.json({ msg: 'Equipment removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// LIVESTOCK CRUD
router.get('/livestock', auth, async (req, res) => {
    try {
        const livestock = await Livestock.find({ user: req.user.id });
        res.json(livestock);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/livestock', auth, async (req, res) => {
    try {
        const newLv = new Livestock({ ...req.body, user: req.user.id });
        const lv = await newLv.save();
        res.json(lv);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
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
        res.status(500).json({ msg: 'Server error' });
    }
});

router.delete('/livestock/:id', auth, async (req, res) => {
    try {
        const lv = await Livestock.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!lv) return res.status(404).json({ msg: 'Livestock not found' });
        res.json({ msg: 'Livestock removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// WORKERS CRUD
router.get('/workers', auth, async (req, res) => {
    try {
        const workers = await Worker.find({ user: req.user.id });
        res.json(workers);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/workers', auth, async (req, res) => {
    try {
        const newWorker = new Worker({ ...req.body, user: req.user.id });
        const worker = await newWorker.save();
        res.json(worker);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
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
        res.status(500).json({ msg: 'Server error' });
    }
});

router.delete('/workers/:id', auth, async (req, res) => {
    try {
        const worker = await Worker.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!worker) return res.status(404).json({ msg: 'Worker not found' });
        res.json({ msg: 'Worker removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/farmer/dashboard-data
router.get('/dashboard-data', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const farmer = await User.findById(userId);
        if (!farmer) return res.status(404).json({ msg: 'Farmer not found' });

        // Get Land for coordinates
        const land = await Land.findOne({ user: userId });

        // Get Stats for AI and Badges
        const [crops, livestock, sales, equipment, workers, reports] = await Promise.all([
            Crop.find({ user: userId }),
            Livestock.find({ user: userId }),
            Sale.find({ user: userId }),
            Equipment.find({ user: userId }),
            Worker.find({ user: userId }),
            Report.find({ user: userId })
        ]);

        // Weather Logic (OpenWeatherMap)
        let weather = {
            current: { temp: 24, condition: "مشمس جزئياً", wind: "12 كم/س" },
            forecast: [
                { day: "الاثنين", temp: 22 },
                { day: "الثلاثاء", temp: 24 },
                { day: "الأربعاء", temp: 19 },
                { day: "الخميس", temp: 21 }
            ]
        };

        const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
        if (WEATHER_API_KEY && land && land.coordinates && land.coordinates.length > 0) {
            try {
                const { lat, lng } = land.coordinates[0];
                const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&lang=ar&appid=${WEATHER_API_KEY}`);
                const weatherData = await weatherRes.json();

                if (weatherData.list) {
                    const current = weatherData.list[0];
                    weather.current = {
                        temp: Math.round(current.main.temp),
                        condition: current.weather[0].description,
                        wind: `${Math.round(current.wind.speed * 3.6)} كم/س`
                    };

                    // Filter forecast (one per day)
                    const daily = [];
                    const seenDays = new Set();
                    const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

                    weatherData.list.forEach(item => {
                        const date = new Date(item.dt * 1000);
                        const dayName = dayNames[date.getDay()];
                        if (!seenDays.has(dayName) && daily.length < 4) {
                            daily.push({ day: dayName, temp: Math.round(item.main.temp) });
                            seenDays.add(dayName);
                        }
                    });
                    weather.forecast = daily;
                }
            } catch (e) {
                console.error("Weather fetch failed:", e);
            }
        }

        // AI Recommendations (Rule-based)
        const recommendations = [];
        if (weather.current.temp > 30) {
            recommendations.push({ type: 'warning', message: 'تنبيه: الطقس المتوقع حار جداً. يُنصح بزيادة وتيرة الري لحماية المحاصيل من الإجهاد المائي.' });
        }

        if (land && land.area > 5 && crops.length < 2) {
            recommendations.push({ type: 'suggestion', message: 'ملاحظة: مساحة أرضك كبيرة (أكثر من 5 هكتار). يمكنك تنويع الإنتاج بزراعة محاصيل موسمية إضافية.' });
        }

        const statsTotalRevenue = sales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
        const lastMonthSales = sales.filter(s => {
            const d = new Date(s.date);
            const now = new Date();
            return d.getMonth() === now.getMonth() - 1 && d.getFullYear() === now.getFullYear();
        });

        if (lastMonthSales.length === 0 && crops.length > 0) {
            recommendations.push({ type: 'alert', message: 'تنبيه: لم يتم تسجيل أي مبيعات خلال الشهر الماضي. هل ترغب في المساعدة في التسويق عبر منصة سيس فلاح؟' });
        }

        if (recommendations.length === 0) {
            recommendations.push({ type: 'info', message: 'حالة مستثمرتك ممتازة. لا توجد تنبيهات طارئة حالياً. استمر في العمل الجيد!' });
        }

        res.json({
            profile: {
                name: `${farmer.firstName} ${farmer.lastName}`,
                location: farmer.region || 'غير محدد',
                avatar: null
            },
            farm: {
                address: farmer.address,
                area: land ? land.area : (parseFloat(farmer.landArea) || 0),
                wilaya: farmer.region,
                coordinates: land ? land.coordinates : []
            },
            weather,
            aiRecommendations: recommendations,
            menuStats: {
                cropsCount: crops.length,
                livestockCount: livestock.length,
                salesCount: sales.length,
                equipmentCount: equipment.length,
                workersCount: workers.length,
                reportsCount: reports.length
            }
        });
    } catch (err) {
        console.error('Dashboard data error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/farmer/search
router.get('/search', auth, async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json({ results: [] });

        const userId = req.user.id;
        const regex = new RegExp(query, 'i');

        const [crops, equipment, livestock, sales] = await Promise.all([
            Crop.find({ user: userId, name: regex }),
            Equipment.find({ user: userId, name: regex }),
            Livestock.find({ user: userId, type: regex }),
            Sale.find({ user: userId, product: regex })
        ]);

        const results = [
            ...crops.map(item => ({ type: 'crop', label: 'محصول', name: item.name, id: item._id })),
            ...equipment.map(item => ({ type: 'equipment', label: 'عتاد', name: item.name, id: item._id })),
            ...livestock.map(item => ({ type: 'livestock', label: 'مواشي', name: item.type, id: item._id })),
            ...sales.map(item => ({ type: 'sale', label: 'مبيعات', name: item.product, id: item._id }))
        ];

        res.json(results);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
