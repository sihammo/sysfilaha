import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, Sprout, TrendingUp, DollarSign, MapPin, Tractor } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import api from "../utils/api";
import { toast } from "sonner";

export default function AdminStatistics() {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalCrops: 0,
    totalRevenue: 0,
    totalLands: 0,
    totalArea: 0,
    totalEquipment: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [growthData, setGrowthData] = useState([]);
  const [topFarmers, setTopFarmers] = useState([]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const [statsData, growth, top] = await Promise.all([
        api.admin.getStats(),
        api.admin.getMonthlyGrowth(),
        api.admin.getTopFarmers()
      ]);

      setStats(statsData);
      setGrowthData(growth);
      setTopFarmers(top);
    } catch (error: any) {
      toast.error(error.message || "Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">جاري تحميل الإحصائيات...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2 text-blue-800">الإحصائيات العامة</h2>
        <p className="text-gray-600">نظرة شاملة على جميع الفلاحين والنشاطات</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="إجمالي الفلاحين" value={stats.totalFarmers} icon={Users} color="blue" label="فلاح مسجل" />
        <StatsCard title="إجمالي المحاصيل" value={stats.totalCrops} icon={Sprout} color="green" label="محصول نشط" />
        <StatsCard title="إجمالي الإيرادات" value={`${stats.totalRevenue.toLocaleString()} د.ج`} icon={DollarSign} color="yellow" label="إيرادات وطنية" />
        <StatsCard title="المساحة المزروعة" value={`${stats.totalArea.toFixed(1)} هكتار`} icon={MapPin} color="orange" label="أراضي مسجلة" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>نمو تسجيل الفلاحين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="فلاحين جدد" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Farmers */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>أفضل الفلاحين أداءً (حسب الإيرادات)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topFarmers.length === 0 ? (
                <p className="text-center text-gray-500">لا توجد بيانات كافية</p>
              ) : (
                topFarmers.map((farmer: any, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{farmer.name}</p>
                        <p className="text-xs text-gray-500">{farmer.region}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-green-600">{farmer.totalRevenue.toLocaleString()} د.ج</p>
                      <p className="text-xs text-gray-400">{farmer.salesCount} عملية بيع</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color, label }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    green: "text-green-600 bg-green-50 border-green-200",
    yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",
    orange: "text-orange-600 bg-orange-50 border-orange-200",
    purple: "text-purple-600 bg-purple-50 border-purple-200",
  };

  return (
    <Card className="hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: color }}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-2 text-gray-800">{value}</h3>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
