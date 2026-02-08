import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, Sprout, TrendingUp, DollarSign, MapPin, Tractor, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart } from "recharts";
import api from "../utils/api";
import { toast } from "sonner";
import { cn } from "../utils/cn";

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
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-slate-500">جاري تحميل الإحصائيات الوطنية...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in-fade" dir="rtl">
      <div className="flex justify-between items-end bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight">الإحصائيات والنمو</h2>
          <p className="text-slate-500 font-medium mt-1">نظرة شاملة على مؤشرات الأداء والنمو في القطاع الفلاحي الرقمي</p>
        </div>
        <div className="hidden md:flex gap-2">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100">محدث الآن</div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="إجمالي الفلاحين" value={stats.totalFarmers} icon={Users} color="blue" label="فلاح مسجل" gradient="from-blue-600 to-indigo-700" />
        <StatsCard title="إجمالي المحاصيل" value={stats.totalCrops} icon={Sprout} color="green" label="محصول نشط" gradient="from-emerald-600 to-teal-700" />
        <StatsCard title="الإيرادات الوطنية" value={`${stats.totalRevenue.toLocaleString()} دج`} icon={DollarSign} color="yellow" label="إجمالي المبيعات" gradient="from-amber-600 to-orange-700" />
        <StatsCard title="المساحة المزروعة" value={`${stats.totalArea.toFixed(1)} هكتار`} icon={MapPin} color="orange" label="أراضي مسجلة" gradient="from-rose-600 to-pink-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <Card className="lg:col-span-2 border-none rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-black text-slate-800">تحليل نمو التسجيلات</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dx={-10} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc', radius: 8 }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Bar dataKey="فلاحين جدد" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Farmers */}
        <Card className="border-none rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Tractor className="w-5 h-5 text-amber-600" />
              </div>
              <CardTitle className="text-xl font-black text-slate-800">الأكثر إنتاجية</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-5">
              {topFarmers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Activity className="w-12 h-12 mb-2 opacity-20" />
                  <p className="font-medium">لا توجد سجلات حالياً</p>
                </div>
              ) : (
                topFarmers.map((farmer: any, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110",
                        index === 0 ? "bg-amber-100 text-amber-700" :
                          index === 1 ? "bg-slate-200 text-slate-700" :
                            index === 2 ? "bg-orange-100 text-orange-700" : "bg-white text-slate-400"
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">{farmer.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{farmer.region}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-900">{farmer.totalRevenue.toLocaleString()} <span className="text-[10px] font-bold">دج</span></p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{farmer.salesCount} مبيعات</p>
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

function StatsCard({ title, value, icon: Icon, color, label, gradient }: any) {
  const colors: any = {
    blue: "bg-blue-600",
    green: "bg-emerald-600",
    yellow: "bg-amber-500",
    orange: "bg-rose-600",
  };

  return (
    <Card className="border-none rounded-[2.5rem] shadow-lg shadow-slate-200/50 overflow-hidden bg-white group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
      <CardContent className="p-0">
        <div className={cn("p-8 bg-gradient-to-br", gradient)}>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white transition-transform group-hover:rotate-12">
              <Icon className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-2">{title}</p>
            <h3 className="text-3xl font-black text-white mb-2 leading-none">{value}</h3>
            <p className="text-white/60 text-xs font-bold">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
