import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Users, Sprout, TrendingUp, DollarSign, MapPin, Tractor, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { motion } from "framer-motion";

export default function AdminStatistics() {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalCrops: 0,
    totalRevenue: 0,
    totalLands: 0,
    totalArea: 0,
    totalEquipment: 0,
  });
  const [cropsByType, setCropsByType] = useState<any[]>([]);
  const [farmerPerformance, setFarmerPerformance] = useState<any[]>([]);
  const [revenueByFarmer, setRevenueByFarmer] = useState<any[]>([]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const farmers = users.filter((u: any) => u.role === "farmer");

    let totalCrops = 0;
    let totalRevenue = 0;
    let totalLands = 0;
    let totalArea = 0;
    let totalEquipment = 0;
    const cropTypesMap: any = {};
    const farmerData: any[] = [];
    const revenueData: any[] = [];

    farmers.forEach((farmer: any) => {
      const crops = JSON.parse(localStorage.getItem(`crops_${farmer.id}`) || "[]");
      const sales = JSON.parse(localStorage.getItem(`sales_${farmer.id}`) || "[]");
      const lands = JSON.parse(localStorage.getItem(`lands_${farmer.id}`) || "[]");
      const equipment = JSON.parse(localStorage.getItem(`equipment_${farmer.id}`) || "[]");

      totalCrops += crops.length;
      totalLands += lands.length;
      totalEquipment += equipment.length;

      const farmerRevenue = sales.reduce((sum: number, sale: any) => sum + (sale.totalPrice || 0), 0);
      totalRevenue += farmerRevenue;

      const farmerArea = lands.reduce((sum: number, land: any) => sum + (land.area || 0), 0);
      totalArea += farmerArea;

      // Count crops by type
      crops.forEach((crop: any) => {
        cropTypesMap[crop.type] = (cropTypesMap[crop.type] || 0) + 1;
      });

      // Farmer performance data
      farmerData.push({
        name: `${farmer.firstName} ${farmer.lastName}`,
        محاصيل: crops.length,
        مبيعات: sales.length,
        أراضي: lands.length,
      });

      // Revenue by farmer
      if (farmerRevenue > 0) {
        revenueData.push({
          name: `${farmer.firstName} ${farmer.lastName}`,
          إيرادات: farmerRevenue,
        });
      }
    });

    setStats({
      totalFarmers: farmers.length,
      totalCrops,
      totalRevenue,
      totalLands,
      totalArea,
      totalEquipment,
    });

    const cropTypesArray = Object.entries(cropTypesMap).map(([type, count]) => ({
      name: type,
      value: count,
    }));
    setCropsByType(cropTypesArray);
    setFarmerPerformance(farmerData);
    setRevenueByFarmer(revenueData);
  };

  const COLORS = ["#1A3A3A", "#4F7942", "#94A3B8", "#64748B", "#334155"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">التقارير التحليلية</h2>
          <p className="text-slate-500 mt-1">قراءة دقيقة للبيانات لاتخاذ قرارات مدروسة</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-3 text-amber-800 text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>هناك 3 فلاحين لم يسجلوا نشاطاً هذا الأسبوع</span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="منظومة الفلاحين"
          value={stats.totalFarmers}
          subtitle="فلاح مسجل حالياً"
          icon={<Users className="w-6 h-6" />}
          color="slate"
        />
        <StatCard
          title="الإنتاج العام"
          value={stats.totalCrops}
          subtitle="محصول نشط في المزارع"
          icon={<Sprout className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="المساحة المنزرعة"
          value={`${stats.totalArea.toFixed(1)} هكتار`}
          subtitle="في مختلف المناطق"
          icon={<MapPin className="w-6 h-6" />}
          color="slate"
        />
        <StatCard
          title="عائدات المنصة"
          value={stats.totalRevenue.toLocaleString()}
          subtitle="دينار جزائري"
          icon={<DollarSign className="w-6 h-6" />}
          color="amber"
          unit="دج"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-[var(--admin-gray-border)] shadow-sm">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-lg font-semibold text-slate-800">توزيع الإنتاج حسب الصنف</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByFarmer.length > 0 ? revenueByFarmer : [{ name: "لا توجد بيانات", إيرادات: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="إيرادات" fill="#1A3A3A" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[var(--admin-gray-border)] shadow-sm">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-lg font-semibold text-slate-800">بيئة المحاصيل</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={cropsByType.length > 0 ? cropsByType : [{ name: "فارغ", value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cropsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-xs">
              {cropsByType.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="text-slate-600 font-medium">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decision Oriented Performance Table */}
      <Card className="border-[var(--admin-gray-border)] shadow-sm">
        <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800">مؤشرات أداء الفلاحين</CardTitle>
          <Button variant="outline" size="sm" className="text-xs">تصدير تقرير مفصل</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">الفلاح</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">المحاصيل</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">المبيعات</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {farmerPerformance.map((farmer, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{farmer.name}</td>
                    <td className="px-6 py-4 text-slate-600">{farmer.محاصيل}</td>
                    <td className="px-6 py-4 text-slate-600">{farmer.مبيعات}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${farmer.مبيعات > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}>
                        {farmer.مبيعات > 0 ? "نشط" : "خامل"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color, unit }: any) {
  const colorMap: any = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <Card className="border-[var(--admin-gray-border)] shadow-sm hover:border-slate-300 transition-all group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${colorMap[color] || colorMap.slate}`}>
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
        </div>
        <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
