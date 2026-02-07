import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, Loader2, Users } from "lucide-react";
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
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("admin_ai_analysis");
    if (saved) {
      const data = JSON.parse(saved);
      setInsights(data.insights);
      setLastAnalysis(new Date(data.date));
    }
  }, []);

  const analyzeAllData = async () => {
    try {
      setAnalyzing(true);
      const data = await api.admin.getFullData();
      const { farmers, crops, sales, lands, workers } = data;

      const newInsights: AIInsight[] = [];

      // 1. Inactive Farmers
      const inactiveFarmers = farmers.filter((f: any) => {
        const farmerCrops = crops.filter((c: any) => c.user?._id === f._id);
        const farmerSales = sales.filter((s: any) => s.user?._id === f._id);
        return farmerCrops.length === 0 && farmerSales.length === 0;
      }).map((f: any) => `${f.firstName} ${f.lastName}`);

      if (inactiveFarmers.length > 0) {
        newInsights.push({
          id: "insight-1",
          type: "critical",
          category: "نشاط الفلاحين",
          title: "فلاحون غير نشطين",
          description: `هناك ${inactiveFarmers.length} فلاح لم يسجل أي نشاط.`,
          affectedFarmers: inactiveFarmers,
          priority: "critical",
        });
      }

      // 2. Financial Overview
      const totalRevenue = sales.reduce((sum: number, s: any) => sum + (s.totalPrice || 0), 0);
      const totalExpenses = workers.reduce((sum: number, w: any) => sum + (w.salary || 0), 0);
      const totalProfit = totalRevenue - totalExpenses;

      newInsights.push({
        id: "insight-profit",
        type: totalProfit >= 0 ? "success" : "critical",
        category: "الأداء المالي",
        title: totalProfit >= 0 ? "أداء اقتصادي إيجابي" : "عجز مالي في المنظومة",
        description: `إجمالي صافي الربح للمنظومة هو ${totalProfit.toLocaleString()} دج.`,
        priority: totalProfit >= 0 ? "low" : "critical",
      });

      // 3. Land Utilization
      const totalLandArea = lands.reduce((sum: number, l: any) => sum + (l.area || 0), 0);
      const totalCropArea = crops.reduce((sum: number, c: any) => sum + (c.area || 0), 0);
      const unusedArea = totalLandArea - totalCropArea;

      if (unusedArea > 10) {
        newInsights.push({
          id: "insight-land",
          type: "info",
          category: "استغلال الأراضي",
          title: "أراضي شاسعة غير مستغلة",
          description: `هناك ${unusedArea.toFixed(1)} هكتار من الأراضي غير المزروعة حالياً.`,
          priority: "medium",
        });
      }

      setInsights(newInsights);
      setLastAnalysis(new Date());
      localStorage.setItem("admin_ai_analysis", JSON.stringify({
        insights: newInsights,
        date: new Date().toISOString(),
      }));

      toast.success("تم تحليل جميع البيانات بنجاح");
    } catch (error) {
      toast.error("فشل التحليل الشامل");
    } finally {
      setAnalyzing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "warning": return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      case "critical": return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case "info": return <Lightbulb className="w-6 h-6 text-blue-600" />;
      default: return <Lightbulb className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-2 text-blue-800">التحليل الذكي الشامل</h2>
          <p className="text-gray-600">تحليل متقدم لبيانات المنظومة</p>
        </div>
        <Button onClick={analyzeAllData} disabled={analyzing} className="bg-blue-600 hover:bg-blue-700">
          {analyzing ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
          تحليل شامل
        </Button>
      </div>

      {insights.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-gray-500">لا توجد تحليلات حالياً</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <Card key={insight.id} className="border-blue-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {getTypeIcon(insight.type)}
                  <div>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <p className="text-sm text-gray-600">{insight.category}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{insight.description}</p>
                {insight.affectedFarmers && insight.affectedFarmers.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {insight.affectedFarmers.map((name, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs border">{name}</span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
