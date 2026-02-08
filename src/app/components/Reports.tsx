import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Download,
  Sprout,
  TrendingUp,
  DollarSign,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingDown,
  Filter
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from "recharts";
import api from "../utils/api";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../utils/cn";

interface ReportsProps {
  userId: string;
}

export default function Reports({ userId }: ReportsProps) {
  const [reportType, setReportType] = useState("overview");
  const [crops, setCrops] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, [userId]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [c, s, w] = await Promise.all([
        api.farmer.getCrops(),
        api.farmer.getSales(),
        api.farmer.getWorkers()
      ]);
      setCrops(c);
      setSales(s);
      setWorkers(w);
    } catch (e) {
      toast.error("فشل تحميل بيانات التقارير");
    } finally {
      setIsLoading(false);
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
  const totalExpenses = workers.reduce((sum, worker) => sum + (worker.salary || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  const cropsByType = crops.reduce((acc: any, crop) => {
    acc[crop.type] = (acc[crop.type] || 0) + 1;
    return acc;
  }, {});

  const cropTypeData = Object.entries(cropsByType).map(([type, count]) => ({
    type,
    عدد: count,
  }));

  const salesByMonth = sales.reduce((acc: any, sale) => {
    const month = new Date(sale.saleDate).toLocaleDateString("ar-DZ", { month: "long" });
    acc[month] = (acc[month] || 0) + (sale.totalPrice || 0);
    return acc;
  }, {});

  const salesData = Object.entries(salesByMonth).map(([month, total]) => ({
    month,
    مبيعات: total,
  }));

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
    <div className="space-y-8 animate-in-fade" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">التقارير والإحصائيات</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">تحليل شامل ومفصل لنشاطك الفلاحي والمالي.</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-64 h-14 bg-white border-slate-100 rounded-2xl shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">نظرة عامة شاملة</SelectItem>
              <SelectItem value="crops">تقرير المحاصيل</SelectItem>
              <SelectItem value="sales">تقرير المبيعات</SelectItem>
              <SelectItem value="financial">التقرير المالي</SelectItem>
            </SelectContent>
          </Select>

          <Button className="h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 flex gap-2 font-bold shadow-xl shadow-primary/20">
            <Download className="w-5 h-5" />
            تصدير PDF
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {reportType === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Financial KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="إجمالي المحاصيل"
                value={crops.length}
                unit="محصول"
                icon={Sprout}
                color="emerald"
                trend="+3"
              />
              <KPICard
                title="إجمالي المبيعات"
                value={totalRevenue.toLocaleString()}
                unit="دج"
                icon={TrendingUp}
                color="blue"
                trend="+12%"
              />
              <KPICard
                title="إجمالي المصروفات"
                value={totalExpenses.toLocaleString()}
                unit="دج"
                icon={DollarSign}
                color="rose"
                trend="-5%"
              />
              <KPICard
                title="صافي الربح"
                value={netProfit.toLocaleString()}
                unit="دج"
                icon={netProfit >= 0 ? TrendingUp : TrendingDown}
                color={netProfit >= 0 ? "emerald" : "rose"}
                trend={netProfit >= 0 ? "+8%" : "-2%"}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Crops by Type */}
              <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-black text-slate-900">توزيع المحاصيل</CardTitle>
                      <p className="text-sm text-slate-400 mt-1 font-medium">حسب نوع الإنتاج الزراعي</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cropTypeData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="type"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
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
                        <Bar dataKey="عدد" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Sales Trend */}
              <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-black text-slate-900">اتجاه المبيعات</CardTitle>
                      <p className="text-sm text-slate-400 mt-1 font-medium">التطور الشهري للإيرادات</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData}>
                        <defs>
                          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
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
                          stroke="#3b82f6"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#salesGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {reportType === "crops" && (
          <motion.div
            key="crops"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="text-2xl font-black text-slate-900">تفاصيل المحاصيل المسجلة</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-right py-5 px-8 text-xs font-black text-slate-500 uppercase tracking-wider">المحصول</th>
                        <th className="text-right py-5 px-8 text-xs font-black text-slate-500 uppercase tracking-wider">النوع</th>
                        <th className="text-right py-5 px-8 text-xs font-black text-slate-500 uppercase tracking-wider">المساحة</th>
                        <th className="text-right py-5 px-8 text-xs font-black text-slate-500 uppercase tracking-wider">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {crops.map((crop) => (
                        <tr key={crop._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-8 font-bold text-slate-900">{crop.name}</td>
                          <td className="py-5 px-8 text-slate-600 font-medium">{crop.type}</td>
                          <td className="py-5 px-8 text-slate-600 font-bold">{crop.area} هكتار</td>
                          <td className="py-5 px-8">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black border border-emerald-100">
                              {crop.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {reportType === "sales" && (
          <motion.div
            key="sales"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="text-2xl font-black text-slate-900">سجل المبيعات التفصيلي</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-right py-5 px-8 text-xs font-black text-slate-500 uppercase tracking-wider">المحصول</th>
                        <th className="text-right py-5 px-8 text-xs font-black text-slate-500 uppercase tracking-wider">الكمية</th>
                        <th className="text-right py-5 px-8 text-xs font-black text-slate-500 uppercase tracking-wider">المشتري</th>
                        <th className="text-right py-5 px-8 text-xs font-black text-slate-500 uppercase tracking-wider">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {sales.map((sale) => (
                        <tr key={sale._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-8 font-bold text-slate-900">{sale.cropName}</td>
                          <td className="py-5 px-8 text-slate-600 font-medium">{sale.quantity} قنطار</td>
                          <td className="py-5 px-8 text-slate-600 font-medium">{sale.buyerName}</td>
                          <td className="py-5 px-8 font-black text-emerald-600">{sale.totalPrice?.toLocaleString()} دج</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {reportType === "financial" && (
          <motion.div
            key="financial"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-[2.5rem] shadow-xl shadow-emerald-500/20 overflow-hidden relative">
                <div className="absolute top-[-20%] right-[-10%] opacity-10 rotate-12">
                  <ArrowUpRight size={200} />
                </div>
                <CardContent className="p-10 relative z-10">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-white/80 font-bold text-sm uppercase tracking-wider mb-2">إجمالي الإيرادات</p>
                  <h3 className="text-5xl font-black leading-none">{totalRevenue.toLocaleString()} <span className="text-xl opacity-70">دج</span></h3>
                </CardContent>
              </Card>

              <Card className="border-none bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-[2.5rem] shadow-xl shadow-rose-500/20 overflow-hidden relative">
                <div className="absolute top-[-20%] right-[-10%] opacity-10 rotate-12">
                  <ArrowDownRight size={200} />
                </div>
                <CardContent className="p-10 relative z-10">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-white/80 font-bold text-sm uppercase tracking-wider mb-2">إجمالي المصروفات</p>
                  <h3 className="text-5xl font-black leading-none">{totalExpenses.toLocaleString()} <span className="text-xl opacity-70">دج</span></h3>
                </CardContent>
              </Card>

              <Card className={cn(
                "border-none text-white rounded-[2.5rem] shadow-xl overflow-hidden relative",
                netProfit >= 0
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20"
                  : "bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/20"
              )}>
                <div className="absolute top-[-20%] right-[-10%] opacity-10 rotate-12">
                  {netProfit >= 0 ? <TrendingUp size={200} /> : <TrendingDown size={200} />}
                </div>
                <CardContent className="p-10 relative z-10">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                    {netProfit >= 0 ? <TrendingUp className="w-7 h-7 text-white" /> : <TrendingDown className="w-7 h-7 text-white" />}
                  </div>
                  <p className="text-white/80 font-bold text-sm uppercase tracking-wider mb-2">صافي الربح</p>
                  <h3 className="text-5xl font-black leading-none">{netProfit.toLocaleString()} <span className="text-xl opacity-70">دج</span></h3>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KPICard({ title, value, unit, icon: Icon, color, trend }: any) {
  const themes: any = {
    emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-100",
    blue: "from-blue-500/10 to-blue-500/5 border-blue-100",
    rose: "from-rose-500/10 to-rose-500/5 border-rose-100",
  };

  const iconThemes: any = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <motion.div whileHover={{ y: -5 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn("rounded-[2rem] border shadow-sm bg-gradient-to-br overflow-hidden relative group transition-all", themes[color])}>
        <div className="absolute top-4 left-4 p-3 rounded-2xl shadow-sm border border-inherit group-hover:scale-110 transition-transform">
          <Icon className={cn("w-6 h-6", iconThemes[color].split(' ')[1])} />
        </div>
        <CardContent className="p-8 pt-10">
          <p className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
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
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}