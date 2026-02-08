import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  Zap,
  Info,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";
import { cn } from "../utils/cn";

interface AIAnalysisProps {
  userId: string;
}

interface Recommendation {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export default function AIAnalysis({ userId }: AIAnalysisProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`ai_analysis_result_${userId}`);
    if (saved) {
      const data = JSON.parse(saved);
      setRecommendations(data.recommendations);
      setSummary(data.summary);
      setLastAnalysis(new Date(data.date));
    }
  }, [userId]);

  const analyzeData = async () => {
    try {
      setAnalyzing(true);
      const data = await api.farmer.getAiConsultation();

      setRecommendations(data.recommendations);
      setSummary(data.summary);
      setLastAnalysis(new Date());

      localStorage.setItem(`ai_analysis_result_${userId}`, JSON.stringify({
        recommendations: data.recommendations,
        summary: data.summary,
        date: new Date().toISOString(),
      }));

      toast.success("تم تحليل البيانات وتوليد التوصيات بنجاح");
    } catch (error) {
      toast.error("فشل في الحصول على الاستشارات الذكية");
    } finally {
      setAnalyzing(false);
    }
  };

  const getRecommendationStyle = (type: string, priority: string) => {
    const styles = {
      success: {
        card: "border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white",
        icon: "bg-emerald-50 text-emerald-600",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200"
      },
      warning: {
        card: "border-amber-100 bg-gradient-to-br from-amber-50/50 to-white",
        icon: "bg-amber-50 text-amber-600",
        badge: "bg-amber-100 text-amber-700 border-amber-200"
      },
      info: {
        card: "border-blue-100 bg-gradient-to-br from-blue-50/50 to-white",
        icon: "bg-blue-50 text-blue-600",
        badge: "bg-blue-100 text-blue-700 border-blue-200"
      }
    };
    return styles[type as keyof typeof styles] || styles.info;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success": return CheckCircle;
      case "warning": return AlertTriangle;
      case "info": return Lightbulb;
      default: return Info;
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      high: "عالية الأولوية",
      medium: "متوسطة",
      low: "منخفضة"
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  return (
    <div className="space-y-8 animate-in-fade" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">التوصيات الذكية</h2>
          </div>
          <p className="text-slate-500 text-lg font-medium">تحليل متقدم بالذكاء الاصطناعي لتحسين أداء مستثمرتك</p>
        </div>

        <Button
          onClick={analyzeData}
          disabled={analyzing}
          className="h-16 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl px-8 flex gap-3 font-black text-lg shadow-xl shadow-purple-500/30 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              جاري التحليل...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              تشغيل التحليل الذكي
            </>
          )}
        </Button>
      </div>

      {/* Last Analysis Info */}
      {lastAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center gap-3"
        >
          <Info className="w-5 h-5 text-slate-400" />
          <p className="text-sm font-bold text-slate-600">
            آخر تحليل تم في: <span className="text-slate-900">{lastAnalysis.toLocaleString('ar-DZ')}</span>
          </p>
        </motion.div>
      )}

      {/* Recommendations */}
      {recommendations.length === 0 ? (
        <Card className="border-none bg-white rounded-[3rem] shadow-sm border border-slate-100">
          <CardContent className="py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-300 mb-2">لا توجد توصيات حالياً</h3>
            <p className="text-slate-400 font-medium">اضغط على زر "تشغيل التحليل الذكي" للحصول على توصيات مخصصة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-black text-slate-900">التوصيات المقترحة ({recommendations.length})</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {recommendations.map((rec, index) => {
                const style = getRecommendationStyle(rec.type, rec.priority);
                const Icon = getTypeIcon(rec.type);

                return (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={cn("border shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-md transition-all", style.card)}>
                      <CardContent className="p-8">
                        <div className="flex items-start gap-6">
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", style.icon)}>
                            <Icon className="w-7 h-7" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <h4 className="text-2xl font-black text-slate-900 leading-tight">{rec.title}</h4>
                              <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase border shrink-0", style.badge)}>
                                {getPriorityLabel(rec.priority)}
                              </span>
                            </div>

                            <p className="text-slate-700 leading-relaxed font-medium text-lg">{rec.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* AI Info Footer */}
      <Card className="border-none bg-gradient-to-br from-purple-50 to-blue-50 rounded-[2rem] overflow-hidden border border-purple-100/50">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-900 mb-2">كيف يعمل التحليل الذكي؟</h4>
              <p className="text-slate-600 leading-relaxed font-medium">
                يقوم النظام بتحليل بياناتك الزراعية والمالية باستخدام خوارزميات متقدمة لتقديم توصيات مخصصة تساعدك على تحسين الإنتاجية،
                تقليل التكاليف، وزيادة الأرباح. التوصيات تأخذ في الاعتبار الموسم الحالي، حالة الأراضي، والأداء المالي.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
