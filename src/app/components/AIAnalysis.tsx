import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";

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
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`ai_analysis_${userId}`);
    if (saved) {
      const data = JSON.parse(saved);
      setRecommendations(data.recommendations);
      setLastAnalysis(new Date(data.date));
    }
  }, [userId]);

  const analyzeData = async () => {
    try {
      setAnalyzing(true);

      // Fetch fresh data from backend
      const [crops, sales, lands, workers] = await Promise.all([
        api.farmer.getCrops(),
        api.farmer.getSales(),
        api.farmer.getLands(),
        api.farmer.getWorkers()
      ]);

      const newRecommendations: Recommendation[] = [];

      // Analyze crops & land
      const totalArea = lands.reduce((sum: number, land: any) => sum + (land.area || 0), 0);
      const usedArea = crops.reduce((sum: number, crop: any) => sum + (crop.area || 0), 0);
      const unusedArea = totalArea - usedArea;

      if (unusedArea > 0) {
        newRecommendations.push({
          id: "rec-1",
          type: "info",
          title: "أراضي غير مستغلة",
          description: `لديك ${unusedArea.toFixed(1)} هكتار غير مزروع. يُنصح باستغلال هذه المساحة لزيادة الإنتاجية.`,
          priority: "medium",
        });
      }

      // Analyze financial performance
      const totalRevenue = sales.reduce((sum: number, sale: any) => sum + (sale.totalPrice || 0), 0);
      const totalExpenses = workers.reduce((sum: number, worker: any) => sum + (worker.salary || 0), 0);
      const profit = totalRevenue - totalExpenses;

      if (profit < 0) {
        newRecommendations.push({
          id: "rec-3",
          type: "warning",
          title: "تنبيه مالي",
          description: `هناك عجز مالي حالي. يُنصح بمراجعة المصروفات وزيادة المبيعات.`,
          priority: "high",
        });
      }

      // Simple seasonal logic
      const month = new Date().getMonth();
      if (month >= 8 && month <= 10) {
        newRecommendations.push({
          id: "rec-6",
          type: "info",
          title: "موسم الزراعة الشتوية",
          description: "الآن موسم مناسب لزراعة القمح والشعير. استعد للموسم الشتوي.",
          priority: "medium",
        });
      }

      setRecommendations(newRecommendations);
      setLastAnalysis(new Date());
      localStorage.setItem(`ai_analysis_${userId}`, JSON.stringify({
        recommendations: newRecommendations,
        date: new Date().toISOString(),
      }));

      toast.success("تم تحليل البيانات بنجاح");
    } catch (error) {
      toast.error("فشل تحليل البيانات");
    } finally {
      setAnalyzing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "warning": return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case "info": return <Lightbulb className="w-6 h-6 text-blue-600" />;
      default: return <Lightbulb className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-2 text-green-800">التوصيات الذكية</h2>
          <p className="text-gray-600">تحليل ذكي لبياناتك مع توصيات مخصصة</p>
        </div>
        <Button onClick={analyzeData} disabled={analyzing} className="bg-green-600 hover:bg-green-700">
          {analyzing ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
          تحليل البيانات
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-gray-500">لا توجد توصيات حالياً</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="border-green-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {getTypeIcon(rec.type)}
                  <CardTitle className="text-lg">{rec.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent><p className="text-gray-700">{rec.description}</p></CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
