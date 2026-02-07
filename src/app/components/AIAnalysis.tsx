import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
    // Load saved analysis
    const saved = localStorage.getItem(`ai_analysis_${userId}`);
    if (saved) {
      const data = JSON.parse(saved);
      setRecommendations(data.recommendations);
      setLastAnalysis(new Date(data.date));
    }
  }, [userId]);

  const analyzeData = () => {
    setAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      const crops = JSON.parse(localStorage.getItem(`crops_${userId}`) || "[]");
      const sales = JSON.parse(localStorage.getItem(`sales_${userId}`) || "[]");
      const lands = JSON.parse(localStorage.getItem(`lands_${userId}`) || "[]");
      const workers = JSON.parse(localStorage.getItem(`workers_${userId}`) || "[]");

      const newRecommendations: Recommendation[] = [];

      // Analyze crops
      const totalArea = lands.reduce((sum: number, land: any) => sum + land.area, 0);
      const usedArea = crops.reduce((sum: number, crop: any) => sum + crop.area, 0);
      const unusedArea = totalArea - usedArea;

      if (unusedArea > 0) {
        newRecommendations.push({
          id: "rec-1",
          type: "info",
          title: "أراضي غير مستغلة",
          description: `لديك ${unusedArea.toFixed(1)} هكتار غير مزروع. يُنصح باستغلال هذه المساحة لزيادة الإنتاجية. يمكنك زراعة محاصيل موسمية سريعة النمو مثل الخضروات.`,
          priority: "medium",
        });
      }

      // Analyze harvest timing
      const readyToHarvest = crops.filter((c: any) => c.status === "جاهز للحصاد");
      if (readyToHarvest.length > 0) {
        newRecommendations.push({
          id: "rec-2",
          type: "warning",
          title: "محاصيل جاهزة للحصاد",
          description: `لديك ${readyToHarvest.length} محصول جاهز للحصاد. يُنصح بالحصاد في أقرب وقت لضمان جودة المنتج وتجنب الخسائر.`,
          priority: "high",
        });
      }

      // Analyze sales performance
      const totalRevenue = sales.reduce((sum: number, sale: any) => sum + sale.totalPrice, 0);
      const totalExpenses = workers.reduce((sum: number, worker: any) => sum + worker.salary, 0);
      const profit = totalRevenue - totalExpenses;

      if (profit > 0) {
        newRecommendations.push({
          id: "rec-3",
          type: "success",
          title: "أداء مالي جيد",
          description: `صافي ربحك الحالي هو ${profit.toLocaleString()} دج. استمر في تحسين الإنتاجية والبحث عن أسواق جديدة لزيادة الأرباح.`,
          priority: "low",
        });
      } else if (profit < 0) {
        newRecommendations.push({
          id: "rec-3",
          type: "warning",
          title: "تنبيه مالي",
          description: `هناك عجز مالي قدره ${Math.abs(profit).toLocaleString()} دج. يُنصح بمراجعة المصروفات وزيادة المبيعات أو تقليل التكاليف.`,
          priority: "high",
        });
      }

      // Analyze crop diversity
      const cropTypes = new Set(crops.map((c: any) => c.type));
      if (cropTypes.size <= 1 && crops.length > 0) {
        newRecommendations.push({
          id: "rec-4",
          type: "info",
          title: "تنويع المحاصيل",
          description: "يُنصح بتنويع المحاصيل لتقليل المخاطر وزيادة الفرص. زراعة أنواع مختلفة تحمي من التقلبات السوقية والمناخية.",
          priority: "medium",
        });
      }

      // Payment status analysis
      const pendingPayments = sales.filter((s: any) => s.paymentStatus !== "مدفوع");
      if (pendingPayments.length > 0) {
        const totalPending = pendingPayments.reduce((sum: number, sale: any) => sum + sale.totalPrice, 0);
        newRecommendations.push({
          id: "rec-5",
          type: "warning",
          title: "مدفوعات معلقة",
          description: `لديك ${totalPending.toLocaleString()} دج من المدفوعات المعلقة. يُنصح بالمتابعة مع المشترين لضمان استلام المستحقات.`,
          priority: "high",
        });
      }

      // Seasonal recommendations
      const currentMonth = new Date().getMonth();
      if (currentMonth >= 8 && currentMonth <= 10) {
        newRecommendations.push({
          id: "rec-6",
          type: "info",
          title: "موسم الزراعة الشتوية",
          description: "الآن موسم مناسب لزراعة القمح والشعير والبقوليات. استعد للموسم الشتوي وخطط لزراعة المحاصيل المناسبة.",
          priority: "medium",
        });
      } else if (currentMonth >= 2 && currentMonth <= 4) {
        newRecommendations.push({
          id: "rec-6",
          type: "info",
          title: "موسم الزراعة الصيفية",
          description: "الآن موسم مناسب لزراعة الخضروات الصيفية مثل الطماطم والفلفل والبطيخ. خطط لموسم صيفي مربح.",
          priority: "medium",
        });
      }

      // Worker productivity
      if (workers.length > 0 && crops.length > 0) {
        const cropsPerWorker = crops.length / workers.length;
        if (cropsPerWorker > 5) {
          newRecommendations.push({
            id: "rec-7",
            type: "warning",
            title: "زيادة عدد العمال",
            description: "نسبة العمال إلى المحاصيل قد تكون غير كافية. يُنصح بتوظيف عمال إضافيين لضمان العناية الجيدة بالمحاصيل.",
            priority: "medium",
          });
        }
      }

      setRecommendations(newRecommendations);
      setLastAnalysis(new Date());

      // Save analysis
      localStorage.setItem(
        `ai_analysis_${userId}`,
        JSON.stringify({
          recommendations: newRecommendations,
          date: new Date().toISOString(),
        })
      );

      setAnalyzing(false);
      toast.success("تم تحليل البيانات بنجاح");
    }, 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "low":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case "info":
        return <Lightbulb className="w-6 h-6 text-blue-600" />;
      default:
        return <Lightbulb className="w-6 h-6 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    const labels = {
      high: "أولوية عالية",
      medium: "أولوية متوسطة",
      low: "أولوية منخفضة",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs ${colors[priority as keyof typeof colors]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-2 text-green-800">التوصيات الذكية</h2>
          <p className="text-gray-600">تحليل ذكي لبياناتك مع توصيات مخصصة</p>
        </div>
        <Button
          onClick={analyzeData}
          disabled={analyzing}
          className="bg-green-600 hover:bg-green-700"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              جاري التحليل...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 ml-2" />
              تحليل البيانات
            </>
          )}
        </Button>
      </div>

      {lastAnalysis && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              آخر تحليل: {lastAnalysis.toLocaleString("ar-DZ", { 
                dateStyle: "medium", 
                timeStyle: "short" 
              })}
            </p>
          </CardContent>
        </Card>
      )}

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Brain className="w-20 h-20 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">لا توجد توصيات حالياً</p>
            <p className="text-gray-400 text-sm">اضغط على "تحليل البيانات" للحصول على توصيات ذكية</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* High Priority */}
          {recommendations.filter((r) => r.priority === "high").length > 0 && (
            <div>
              <h3 className="text-xl mb-3 text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                توصيات عاجلة
              </h3>
              <div className="space-y-3">
                {recommendations
                  .filter((r) => r.priority === "high")
                  .map((rec) => (
                    <Card key={rec.id} className={getPriorityColor(rec.priority)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(rec.type)}
                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                          </div>
                          {getPriorityBadge(rec.priority)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{rec.description}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Medium Priority */}
          {recommendations.filter((r) => r.priority === "medium").length > 0 && (
            <div>
              <h3 className="text-xl mb-3 text-yellow-700 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                توصيات للتحسين
              </h3>
              <div className="space-y-3">
                {recommendations
                  .filter((r) => r.priority === "medium")
                  .map((rec) => (
                    <Card key={rec.id} className={getPriorityColor(rec.priority)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(rec.type)}
                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                          </div>
                          {getPriorityBadge(rec.priority)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{rec.description}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Low Priority */}
          {recommendations.filter((r) => r.priority === "low").length > 0 && (
            <div>
              <h3 className="text-xl mb-3 text-green-700 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                معلومات إضافية
              </h3>
              <div className="space-y-3">
                {recommendations
                  .filter((r) => r.priority === "low")
                  .map((rec) => (
                    <Card key={rec.id} className={getPriorityColor(rec.priority)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(rec.type)}
                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                          </div>
                          {getPriorityBadge(rec.priority)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{rec.description}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
