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

// @route   GET api/admin/dashboard-stats
// @desc    Get real-time statistics for admin dashboard
// @access  Private/Admin
router.get('/dashboard-stats', [auth, adminAuth], async (req, res) => {
    try {
        // Query 1: Total Area (Sum of all Land documents)
        const areaResult = await Land.aggregate([
            { $group: { _id: null, total: { $sum: "$area" } } }
        ]);
        const totalAreaValue = areaResult.length > 0 ? areaResult[0].total : 0;

        // Query 2: Total Registered Farmers
        const totalFarmers = await User.countDocuments({ role: 'farmer' });

        // Query 3: Active Farmers (Approved)
        const activeFarmers = await User.countDocuments({ role: 'farmer', status: 'approved' });

        res.json({
            totalArea: totalAreaValue,
            totalFarmers: totalFarmers,
            activeFarmers: activeFarmers,
            systemStatus: "connected"
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).send('Server Error');
    }
});

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
        const crops = await Crop.find().populate('user', 'firstName lastName phone region');
        const sales = await Sale.find().populate('user', 'firstName lastName phone region');
        const lands = await Land.find().populate('user', 'firstName lastName phone region landArea');
        const equipment = await Equipment.find().populate('user', 'firstName lastName phone region');
        const workers = await Worker.find().populate('user', 'firstName lastName phone region');
        const livestock = await Livestock.find().populate('user', 'firstName lastName phone region');

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
        console.error('Full data error:', err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/monthly-growth
// @desc    Get farmer registration growth by month
// @access  Private/Admin
router.get('/monthly-growth', [auth, adminAuth], async (req, res) => {
    try {
        const growth = await User.aggregate([
            { $match: { role: 'farmer' } },
            {
                $group: {
                    _id: {
                        month: { $month: "$registrationDate" },
                        year: { $year: "$registrationDate" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Format for Recharts
        const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        const formattedData = growth.map(item => ({
            name: months[item._id.month - 1], // Month name
            "فلاحين جدد": item.count
        }));

        res.json(formattedData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/top-farmers
// @desc    Get top 5 farmers by revenue
// @access  Private/Admin
router.get('/top-farmers', [auth, adminAuth], async (req, res) => {
    try {
        const topFarmers = await Sale.aggregate([
            {
                $group: {
                    _id: "$user",
                    totalRevenue: { $sum: "$totalPrice" },
                    salesCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "farmerInfo"
                }
            },
            { $unwind: "$farmerInfo" },
            {
                $project: {
                    _id: 1,
                    totalRevenue: 1,
                    salesCount: 1,
                    name: { $concat: ["$farmerInfo.firstName", " ", "$farmerInfo.lastName"] },
                    region: "$farmerInfo.region",
                    phone: "$farmerInfo.phone"
                }
            }
        ]);

        res.json(topFarmers);
    } catch (err) {
        console.error(err);
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

// @route   POST api/admin/ai-analysis
// @desc    Perform comprehensive FREE rule-based AI analysis on the national agricultural system
// @access  Private/Admin
router.post('/ai-analysis', [auth, adminAuth], async (req, res) => {
    try {
        const analysis = {
            timestamp: new Date(),
            insights: [],
            statistics: {},
            recommendations: []
        };

        const totalFarmersCount = await User.countDocuments({ role: 'farmer' });

        // 1. Inactive Farmers Analysis (30+ days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const inactiveFarmers = await User.find({
            role: 'farmer',
            status: 'approved',
            $or: [
                { lastLogin: { $lt: thirtyDaysAgo } },
                { lastLogin: { $exists: false } }
            ]
        }).select('firstName lastName phone region lastLogin');

        if (inactiveFarmers.length > 0) {
            const percentage = totalFarmersCount > 0 ? ((inactiveFarmers.length / totalFarmersCount) * 100).toFixed(1) : 0;
            analysis.insights.push({
                type: 'warning',
                priority: 'high',
                category: 'نشاط الفلاحين',
                title: 'فلاحون غير نشطين',
                message: `${inactiveFarmers.length} فلاح (${percentage}%) لم يسجلوا دخول منذ 30 يوماً`,
                recommendation: 'يُنصح بالتواصل مع الفلاحين غير النشطين لتقديم الدعم والتحفيز للاستمرار في الرقمنة',
                icon: '⚠️',
                affectedCount: inactiveFarmers.length,
                data: {
                    count: inactiveFarmers.length,
                    percentage: percentage,
                    farmers: inactiveFarmers.slice(0, 10).map(f => ({
                        name: `${f.firstName} ${f.lastName}`,
                        wilaya: f.region || 'غير محدد',
                        daysSinceLogin: f.lastLogin ? Math.floor((Date.now() - f.lastLogin) / (1000 * 60 * 60 * 24)) : 'لم يسجل دخول'
                    }))
                }
            });
        }

        // 2. Underutilized Land Analysis
        const underutilizedFarms = await Land.aggregate([
            {
                $lookup: {
                    from: 'crops',
                    localField: 'user',
                    foreignField: 'user',
                    as: 'userCrops'
                }
            },
            {
                $addFields: {
                    cropsCount: { $size: '$userCrops' },
                    cropArea: { $sum: '$userCrops.area' }
                }
            },
            {
                $addFields: {
                    unusedArea: { $subtract: ['$area', '$cropArea'] }
                }
            },
            {
                $match: {
                    area: { $gt: 1 },
                    unusedArea: { $gt: 0.5 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'farmer'
                }
            },
            { $unwind: '$farmer' }
        ]);

        if (underutilizedFarms.length > 0) {
            const totalUnused = underutilizedFarms.reduce((sum, f) => sum + (f.unusedArea || 0), 0);
            const potentialRevenue = totalUnused * 50000;

            analysis.insights.push({
                type: 'opportunity',
                priority: 'medium',
                category: 'استغلال الأراضي',
                title: 'أراضي غير مستغلة بالكامل',
                message: `${totalUnused.toFixed(2)} هكتار غير مستغلة في ${underutilizedFarms.length} مزرعة`,
                recommendation: `يمكن زيادة الإنتاج الوطني بزراعة هذه المساحات - إيرادات محتملة: ${potentialRevenue.toLocaleString('ar-DZ')} دج`,
                icon: '🌱',
                data: {
                    totalUnusedArea: totalUnused.toFixed(2),
                    farmsCount: underutilizedFarms.length,
                    potentialRevenue: potentialRevenue
                }
            });
        }

        // 3. Financial Performance Analysis
        const salesStats = await Sale.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' },
                    totalSalesCount: { $sum: 1 },
                    avgSale: { $avg: '$totalPrice' }
                }
            }
        ]);

        const totalEqCost = (await Equipment.aggregate([{ $group: { _id: null, total: { $sum: '$cost' } } }]))[0]?.total || 0;
        const totalWorkerCost = (await Worker.aggregate([{ $group: { _id: null, total: { $sum: '$salary' } } }]))[0]?.total || 0;

        if (salesStats.length > 0) {
            const revenue = salesStats[0].totalRevenue || 0;
            const costs = totalEqCost + (totalWorkerCost * 6); // Assuming 6 month period
            const profit = revenue - costs;
            const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0;

            analysis.statistics.financial = {
                totalRevenue: revenue,
                totalCosts: costs,
                profit,
                profitMargin: parseFloat(profitMargin),
                avgSaleAmount: salesStats[0].avgSale
            };

            const healthStatus =
                profitMargin >= 30 ? { status: 'ممتاز', color: 'green', icon: '✅' } :
                    profitMargin >= 20 ? { status: 'جيد', color: 'blue', icon: '👍' } :
                        profitMargin >= 10 ? { status: 'مقبول', color: 'orange', icon: '⚠️' } :
                            { status: 'يحتاج تحسين', color: 'red', icon: '❌' };

            analysis.insights.push({
                type: profitMargin >= 20 ? 'success' : 'warning',
                priority: profitMargin < 10 ? 'high' : 'low',
                category: 'الأداء المالي',
                title: `الأداء المالي الوطني: ${healthStatus.status}`,
                message: `هامش الربح الوسطي: ${profitMargin}% | الإيرادات: ${revenue.toLocaleString('ar-DZ')} دج`,
                recommendation: profitMargin < 20
                    ? 'يُنصح بمراجعة استراتيجيات التسويق وتقليل التكاليف التشغيلية للفلاحين'
                    : 'الأداء المالي الوطني مستقر، يُشجع على زيادة الاستثمار في التقنيات الحديثة',
                icon: healthStatus.icon,
                data: analysis.statistics.financial
            });
        }

        // 4. Regional Performance
        const regionalStats = await User.aggregate([
            { $match: { role: 'farmer' } },
            {
                $group: {
                    _id: '$region',
                    totalFarmers: { $sum: 1 }
                }
            },
            { $sort: { totalFarmers: -1 } },
            { $limit: 10 }
        ]);

        analysis.statistics.regional = regionalStats;

        if (regionalStats.length > 0) {
            const topWilaya = regionalStats[0];
            analysis.insights.push({
                type: 'info',
                priority: 'low',
                category: 'التوزيع الجغرافي',
                title: 'الأداء الإقليمي',
                message: `${topWilaya._id || 'غير محدد'} في الصدارة من حيث عدد الانخراطات`,
                recommendation: 'يُنصح بتكثيف الدعم في المناطق الأقل انخراطاً لتحقيق توازن وطني',
                icon: '📍',
                data: regionalStats.map(r => ({
                    wilaya: r._id || 'غير محدد',
                    farmers: r.totalFarmers
                }))
            });
        }

        // 5. Crop Diversity Analysis
        const cropDiversity = await Crop.aggregate([
            {
                $group: {
                    _id: '$name',
                    count: { $sum: 1 },
                    totalArea: { $sum: '$area' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        if (cropDiversity.length > 0) {
            const topCrop = cropDiversity[0];
            analysis.insights.push({
                type: cropDiversity.length >= 8 ? 'success' : 'warning',
                priority: cropDiversity.length < 5 ? 'high' : 'low',
                category: 'التنوع الزراعي',
                title: `${cropDiversity.length} نوع محصول مختلف`,
                message: `المحصول الأكثر شيوعاً: ${topCrop._id}`,
                recommendation: cropDiversity.length < 8
                    ? 'تشجيع الفلاحين على تنويع المحاصيل لتقليل المخاطر وزيادة السيادة الغذائية'
                    : 'مستوى تنوع جيد يساهم في ثبات أسعار السوق المحلي',
                icon: '🌾',
                data: cropDiversity.slice(0, 5).map(c => ({
                    type: c._id,
                    count: c.count,
                    area: c.totalArea?.toFixed(2)
                }))
            });
        }

        // 6. Growth Trends
        const last90Days = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const recentFarmers = await User.aggregate([
            { $match: { role: 'farmer', registrationDate: { $gte: last90Days } } },
            {
                $group: {
                    _id: {
                        month: { $month: '$registrationDate' },
                        year: { $year: '$registrationDate' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } }
        ]);

        if (recentFarmers.length > 0) {
            const currentMonthCount = recentFarmers[0].count;
            const previousMonthCount = recentFarmers[1]?.count || 0;
            const trend = currentMonthCount > previousMonthCount ? 'تصاعدي' : 'مستقر/تنازلي';

            analysis.insights.push({
                type: trend === 'تصاعدي' ? 'success' : 'warning',
                priority: 'low',
                category: 'النمو',
                title: `اتجاه التسجيلات: ${trend}`,
                message: `${currentMonthCount} فلاح جديد مسجل مؤخراً`,
                recommendation: trend === 'تصاعدي' ? 'النمو إيجابي، استمروا في حملات الرقمنة' : 'يُنصح بزيادة حملات التوعية الميدانية لجذب فلاحين جدد',
                icon: trend === 'تصاعدي' ? '📈' : '📉'
            });
        }

        // Overall Health Calculation
        const calculateOverallHealth = (insights) => {
            const weights = { success: 10, info: 5, opportunity: 5, warning: -5, critical: -10 };
            let totalScore = 50;
            insights.forEach(i => totalScore += (weights[i.type] || 0));
            const percentage = Math.max(0, Math.min(100, totalScore));

            if (percentage > 80) return { status: 'ممتاز', color: 'green', percentage };
            if (percentage > 60) return { status: 'جيد', color: 'blue', percentage };
            if (percentage > 40) return { status: 'متوسط', color: 'orange', percentage };
            return { status: 'يحتاج اهتمام', color: 'red', percentage };
        };

        analysis.summary = {
            totalInsights: analysis.insights.length,
            overallHealth: calculateOverallHealth(analysis.insights),
            highPriority: analysis.insights.filter(i => i.priority === 'high').length
        };

        res.json({ success: true, analysis });

    } catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({ success: false, msg: 'فشل التحليل الذكي للبيانات' });
    }
});

module.exports = router;
