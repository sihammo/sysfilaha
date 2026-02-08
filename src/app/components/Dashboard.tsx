import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Sprout,
  TrendingUp,
  Tractor,
  Coins,
  ArrowUpRight,
  Calendar,
  CloudSun,
  Map as MapIcon,
  ChevronRight,
  TrendingDown
} from "lucide-react";
import { Button } from "./ui/button";
import FarmerLocationView from "./FarmerLocationView";
import api from "../utils/api";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../utils/cn";

interface DashboardProps {
  userId: string;
  userRegion?: string;
  userLandArea?: string;
  userAddress?: string;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#6366f1"];

export default function Dashboard({ userId, userRegion, userLandArea, userAddress }: DashboardProps) {
  const [stats, setStats] = useState({
    totalCrops: 0,
    totalSales: 0,
    totalResources: 0,
    totalRevenue: 0,
    netProfit: 0,
    totalAnnualCost: 0,
    cropData: [] as { name: string, value: number }[],
    salesData: [] as { month: string, مبيعات: number }[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await api.farmer.getStats();
      setStats(data);
    } catch (error: any) {
      toast.error("فشل في تحميل الإحصائيات");
    } finally {
      setIsLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in-fade">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] rounded-3xl" />
          <Skeleton className="h-[400px] rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">نظرة عامة</h2>
          <p className="text-slate-500 mt-2 text-lg">أهلاً بك مجدداً. إليك تفاصيل نشاطك الفلاحي لهذا اليوم.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('ar-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="المحاصيل المسجلة"
          value={stats.totalCrops}
          unit="محصول"
          icon={Sprout}
          color="green"
          trend="+2"
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={stats.totalRevenue ? stats.totalRevenue.toLocaleString() : 0}
          unit="د.ج"
          icon={TrendingUp}
          color="blue"
          trend="+15%"
        />
        <StatCard
          title="صافي الربح التقديري"
          value={stats.netProfit ? stats.netProfit.toLocaleString() : 0}
          unit="د.ج"
          icon={Coins}
          color="emerald"
        />
        <StatCard
          title="العتاد والموارد"
          value={stats.totalResources}
          unit="مورد"
          icon={Tractor}
          color="amber"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart - Wider */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="rounded-3xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden h-full">
            <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">تحليل المبيعات</CardTitle>
                <p className="text-sm text-slate-400 mt-1">تطور المبيعات خلال الأشهر الأخيرة</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
                <ArrowUpRight className="w-3 h-3" />
                <span>نمو بنسبة 12%</span>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.salesData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        padding: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="مبيعات"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Crops Distribution - Smaller */}
        <motion.div variants={item}>
          <Card className="rounded-3xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white h-full">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-xl font-bold">توزيع المحاصيل</CardTitle>
              <p className="text-sm text-slate-400 mt-1">نسبة الإنتاج حسب النوع</p>
            </CardHeader>
            <CardContent className="p-8 flex flex-col items-center">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.cropData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.cropData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full mt-4 space-y-2">
                {stats.cropData.slice(0, 4).map((entry, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-slate-600 font-medium">{entry.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{entry.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Map and Weather Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {userRegion && (
          <motion.div variants={item}>
            <FarmerLocationView
              region={userRegion}
              landArea={userLandArea || "غير محدد"}
              address={userAddress || "لم يتم تحديد العنوان"}
            />
          </motion.div>
        )}

        <motion.div variants={item}>
          <Card className="rounded-3xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-gradient-to-br from-primary to-emerald-700 text-white h-full relative overflow-hidden group">
            <div className="absolute top-[-20px] right-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-500">
              <CloudSun size={200} />
            </div>
            <CardHeader className="p-8">
              <div className="flex items-center justify-between relative z-10">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                  <CloudSun className="w-6 h-6" /> حالة الطقس المتوقعة
                </CardTitle>
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">ولاية {userRegion}</span>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 relative z-10">
              <div className="flex items-end gap-6 mb-8">
                <div className="text-6xl font-black">24°</div>
                <div className="pb-2">
                  <p className="text-xl font-bold">مشمس جزئياً</p>
                  <p className="text-white/70">الرياح: 12 كم/س</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-6 border-t border-white/10 uppercase">
                <WeatherDay day="الاثنين" temp="22°" />
                <WeatherDay day="الثلاثاء" temp="24°" />
                <WeatherDay day="الأربعاء" temp="19°" />
                <WeatherDay day="الخميس" temp="21°" />
              </div>
              <Button className="w-full mt-8 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md rounded-2xl h-12 flex gap-2 font-bold">
                مشاهدة التوقعات كاملة <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, unit, icon: Icon, color, trend }: any) {
  const colors: any = {
    green: "from-green-500/10 to-green-500/5 text-green-600 border-green-100",
    blue: "from-blue-500/10 to-blue-500/5 text-blue-600 border-blue-100",
    amber: "from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-100",
    emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-100",
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={cn("rounded-3xl border shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white overflow-hidden relative group transition-all", colors[color])}>
        <div className="absolute top-4 left-4 p-3 rounded-2xl bg-white shadow-sm border border-inherit group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6" />
        </div>
        <CardContent className="p-8 pt-10">
          <p className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-black text-slate-900 tracking-tight">{value}</span>
            <span className="text-sm font-bold text-slate-400">{unit}</span>
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-3 px-2 py-0.5 rounded-lg text-[10px] font-black w-fit",
              trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              {trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{trend}</span>
              <span className="text-slate-400 font-medium ml-1">مقارنة بالشهر الماضي</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WeatherDay({ day, temp }: any) {
  return (
    <div className="text-center space-y-2">
      <p className="text-[10px] font-bold text-white/60">{day}</p>
      <CloudSun className="w-5 h-5 mx-auto" />
      <p className="text-sm font-black">{temp}</p>
    </div>
  );
}
