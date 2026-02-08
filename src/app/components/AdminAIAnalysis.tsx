import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, Loader2, Users, Sparkles, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";

interface AIInsight {
  id: string;
  type: "success" | "warning" | "info" | "critical";
  category: string;
  title: string;
  description: string;
  affectedFarmers?: string[];
  priority: "critical" | "high" | "medium" | "low";
}

export default function AdminAIAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("admin_ai_analysis_result");
    if (saved) {
      setAnalysis(JSON.parse(saved));
    }
  }, []);

  const runFullAnalysis = async () => {
    try {
      setAnalyzing(true);
      const data = await api.admin.runAiAnalysis();
      setAnalysis(data.analysis);
      localStorage.setItem("admin_ai_analysis_result", JSON.stringify(data.analysis));
      toast.success("تم تشغيل التحليل الذكي بنجاح");
    } catch (error) {
      toast.error("فشل التحليل الذكي الشامل");
    } finally {
      setAnalyzing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="w-6 h-6 text-emerald-600" />;
      case "warning": return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case "critical": return <AlertTriangle className="w-6 h-6 text-rose-600" />;
      case "opportunity": return <TrendingUp className="w-6 h-6 text-blue-600" />;
      default: return <Lightbulb className="w-6 h-6 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-in-fade" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 leading-tight">التحليل الذكي للمنظومة</h2>
            <p className="text-slate-500 font-medium">رؤى شاملة وتوقعات مبنية على بيانات المنصة الوطنية</p>
          </div>
        </div>
        <Button
          onClick={runFullAnalysis}
          disabled={analyzing}
          className="h-16 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex gap-3 font-bold text-lg shadow-xl shadow-blue-100 transition-all hover:scale-[1.02]"
        >
          {analyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
          {analyzing ? "جاري التحليل..." : "بدء التحليل الشامل"}
        </Button>
      </div>

      {analysis ? (
        <div className="space-y-8">
          {/* System Health Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[2rem] overflow-hidden shadow-xl">
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                  <h3 className="text-slate-400 font-bold mb-4 uppercase tracking-widest text-sm">مؤشر صحة المنظومة الوطنية</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-black">{analysis.summary.overallHealth.percentage}%</span>
                    <span className={`text-2xl font-bold text-${analysis.summary.overallHealth.color}-400`}>
                      {analysis.summary.overallHealth.status}
                    </span>
                  </div>
                  <p className="mt-4 text-slate-300 font-medium leading-relaxed max-w-md">
                    هذا المؤشر يعكس استقرار النشاط الفلاحي، كفاءة استغلال الأراضي، والنمو الاقتصادي العام في المنصة.
                  </p>
                </div>
                <div className="hidden lg:block">
                  <Target className="w-32 h-32 text-slate-700 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-center p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">إجمالي الرؤى</span>
                  <span className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black">{analysis.summary.totalInsights}</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">تاريخ التحليل</span>
                  <span className="text-slate-900 font-black text-sm">{new Date(analysis.timestamp).toLocaleDateString('ar-DZ')}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysis.insights.map((insight: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-none bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden h-full">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      <div className="shrink-0 mt-1">
                        {getTypeIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-xs font-black text-blue-600 uppercase tracking-tighter mb-1">{insight.category}</p>
                            <h4 className="text-xl font-black text-slate-900">{insight.title}</h4>
                          </div>
                          {insight.priority === 'high' && (
                            <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black border border-rose-100">عاجل</span>
                          )}
                        </div>
                        <p className="text-slate-600 font-medium mb-6 leading-relaxed">{insight.message}</p>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                          <div className="flex items-start gap-3">
                            <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-slate-800 font-bold text-sm leading-relaxed">
                              {insight.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Statistics Section */}
          {analysis.statistics.financial && (
            <Card className="border-none bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                  <CardTitle className="text-2xl font-black">الأداء المالي الوطني</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <p className="text-slate-500 font-bold">إجمالي الإيرادات</p>
                    <p className="text-3xl font-black text-slate-900">{analysis.statistics.financial.totalRevenue.toLocaleString()} دج</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 font-bold">إجمالي التكاليف (تقديري)</p>
                    <p className="text-3xl font-black text-rose-600">{analysis.statistics.financial.totalCosts.toLocaleString()} دج</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 font-bold">هامش الربح</p>
                    <p className="text-3xl font-black text-emerald-600">{analysis.statistics.financial.profitMargin}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="border-none bg-white rounded-[3rem] shadow-sm border border-slate-100">
          <CardContent className="py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-300 mb-2">لا توجد تحليلات شاملة متاحة</h3>
            <p className="text-slate-400 font-medium">اضغط على زر "بدء التحليل الشامل" لمسح كافة بيانات المنظومة وتوليد الرؤى.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
