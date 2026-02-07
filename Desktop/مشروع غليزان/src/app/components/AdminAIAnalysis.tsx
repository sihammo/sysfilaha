import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, Loader2, Users, BarChart3 } from "lucide-react";
import { toast } from "sonner";

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

  const analyzeAllData = () => {
    setAnalyzing(true);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const farmers = users.filter((u: any) => u.role === "farmer");
      const newInsights: AIInsight[] = [];

      let totalCrops = 0;
      let totalRevenue = 0;
      let totalExpenses = 0;
      let activeFarmers = 0;
      let inactiveFarmers: string[] = [];
      let lowPerformers: string[] = [];
      let topPerformers: string[] = [];
      let farmersWithPendingPayments: string[] = [];
      let farmersWithIdleLand: string[] = [];

      farmers.forEach((farmer: any) => {
        const crops = JSON.parse(localStorage.getItem(`crops_${farmer.id}`) || "[]");
        const sales = JSON.parse(localStorage.getItem(`sales_${farmer.id}`) || "[]");
        const lands = JSON.parse(localStorage.getItem(`lands_${farmer.id}`) || "[]");
        const workers = JSON.parse(localStorage.getItem(`workers_${farmer.id}`) || "[]");

        totalCrops += crops.length;

        const farmerRevenue = sales.reduce((sum: number, sale: any) => sum + sale.totalPrice, 0);
        const farmerExpenses = workers.reduce((sum: number, worker: any) => sum + worker.salary, 0);
        totalRevenue += farmerRevenue;
        totalExpenses += farmerExpenses;

        const farmerName = `${farmer.firstName} ${farmer.lastName}`;

        // Check if farmer is active
        if (crops.length === 0 && sales.length === 0) {
          inactiveFarmers.push(farmerName);
        } else {
          activeFarmers++;
        }

        // Performance analysis
        const profit = farmerRevenue - farmerExpenses;
        if (profit < 0 && sales.length > 0) {
          lowPerformers.push(farmerName);
        } else if (profit > 500000) {
          topPerformers.push(farmerName);
        }

        // Pending payments check
        const pendingPayments = sales.filter((s: any) => s.paymentStatus !== "مدفوع");
        if (pendingPayments.length > 0) {
          farmersWithPendingPayments.push(farmerName);
        }

        // Idle land check
        const totalArea = lands.reduce((sum: number, land: any) => sum + land.area, 0);
        const usedArea = crops.reduce((sum: number, crop: any) => sum + crop.area, 0);
        if (totalArea - usedArea > 5) {
          farmersWithIdleLand.push(farmerName);
        }
      });

      // Generate insights
      
      // Critical: Inactive farmers
      if (inactiveFarmers.length > 0) {
        newInsights.push({
          id: "insight-1",
          type: "critical",
          category: "نشاط الفلاحين",
          title: "فلاحون غير نشطين",
          description: `هناك ${inactiveFarmers.length} فلاح لم يسجل أي نشاط. يُنصح بالتواصل معهم لتقديم الدعم والإرشاد.`,
          affectedFarmers: inactiveFarmers,
          priority: "critical",
        });
      }

      // High: Low performers
      if (lowPerformers.length > 0) {
        newInsights.push({
          id: "insight-2",
          type: "warning",
          category: "الأداء المالي",
          title: "فلاحون بأداء مالي ضعيف",
          description: `${lowPerformers.length} فلاح يعاني من عجز مالي. يحتاجون لمساعدة في تحسين الإنتاجية أو تقليل التكاليف.`,
          affectedFarmers: lowPerformers,
          priority: "high",
        });
      }

      // Success: Top performers
      if (topPerformers.length > 0) {
        newInsights.push({
          id: "insight-3",
          type: "success",
          category: "أداء متميز",
          title: "فلاحون متميزون",
          description: `${topPerformers.length} فلاح حقق أرباح ممتازة. يمكن الاستفادة من تجاربهم لمساعدة الآخرين.`,
          affectedFarmers: topPerformers,
          priority: "low",
        });
      }

      // Warning: Pending payments
      if (farmersWithPendingPayments.length > 0) {
        newInsights.push({
          id: "insight-4",
          type: "warning",
          category: "المدفوعات",
          title: "مدفوعات معلقة",
          description: `${farmersWithPendingPayments.length} فلاح لديه مدفوعات معلقة. يُنصح بمساعدتهم في متابعة المستحقات.`,
          affectedFarmers: farmersWithPendingPayments,
          priority: "high",
        });
      }

      // Info: Idle land
      if (farmersWithIdleLand.length > 0) {
        newInsights.push({
          id: "insight-5",
          type: "info",
          category: "استغلال الأراضي",
          title: "أراضي غير مستغلة",
          description: `${farmersWithIdleLand.length} فلاح لديه مساحات كبيرة غير مزروعة. فرصة لزيادة الإنتاج.`,
          affectedFarmers: farmersWithIdleLand,
          priority: "medium",
        });
      }

      // Overall statistics insight
      const totalProfit = totalRevenue - totalExpenses;
      if (totalProfit > 0) {
        newInsights.push({
          id: "insight-6",
          type: "success",
          category: "الأداء العام",
          title: "أداء اقتصادي إيجابي",
          description: `إجمالي صافي الربح للمنظومة هو ${totalProfit.toLocaleString()} دج. النظام يعمل بكفاءة جيدة.`,
          priority: "low",
        });
      } else if (totalProfit < 0) {
        newInsights.push({
          id: "insight-6",
          type: "critical",
          category: "الأداء العام",
          title: "تنبيه اقتصادي حرج",
          description: `هناك عجز عام قدره ${Math.abs(totalProfit).toLocaleString()} دج. يجب اتخاذ إجراءات عاجلة لتحسين الوضع.`,
          priority: "critical",
        });
      }

      // Crop diversity
      const cropTypes = new Set<string>();
      farmers.forEach((farmer: any) => {
        const crops = JSON.parse(localStorage.getItem(`crops_${farmer.id}`) || "[]");
        crops.forEach((crop: any) => cropTypes.add(crop.type));
      });

      if (cropTypes.size < 3 && totalCrops > 5) {
        newInsights.push({
          id: "insight-7",
          type: "info",
          category: "تنوع المحاصيل",
          title: "تنوع محدود في المحاصيل",
          description: `يوجد فقط ${cropTypes.size} أنواع من المحاصيل. التنويع يقلل المخاطر ويزيد الفرص.`,
          priority: "medium",
        });
      }

      // Activity rate
      const activityRate = (activeFarmers / farmers.length) * 100;
      if (activityRate < 50) {
        newInsights.push({
          id: "insight-8",
          type: "warning",
          category: "معدل النشاط",
          title: "معدل نشاط منخفض",
          description: `فقط ${activityRate.toFixed(0)}% من الفلاحين نشطون. يجب تحفيز المزيد من الفلاحين على المشاركة.`,
          priority: "high",
        });
      }

      // Seasonal recommendations
      const currentMonth = new Date().getMonth();
      if (currentMonth >= 8 && currentMonth <= 10) {
        newInsights.push({
          id: "insight-9",
          type: "info",
          category: "توصيات موسمية",
          title: "موسم الزراعة الشتوية",
          description: "الآن الوقت المثالي لتشجيع الفلاحين على زراعة القمح والشعير والبقوليات الشتوية.",
          priority: "medium",
        });
      }

      setInsights(newInsights);
      setLastAnalysis(new Date());

      localStorage.setItem(
        "admin_ai_analysis",
        JSON.stringify({
          insights: newInsights,
          date: new Date().toISOString(),
        })
      );

      setAnalyzing(false);
      toast.success("تم تحليل جميع البيانات بنجاح");
    }, 2500);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-red-300 bg-red-50";
      case "high":
        return "border-orange-200 bg-orange-50";
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
        return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      case "critical":
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case "info":
        return <Lightbulb className="w-6 h-6 text-blue-600" />;
      default:
        return <Lightbulb className="w-6 h-6 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    const labels = {
      critical: "حرج",
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
          <h2 className="text-3xl mb-2 text-blue-800">التحليل الذكي الشامل</h2>
          <p className="text-gray-600">تحليل متقدم لجميع بيانات الفلاحين مع توصيات استراتيجية</p>
        </div>
        <Button
          onClick={analyzeAllData}
          disabled={analyzing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              جاري التحليل...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 ml-2" />
              تحليل شامل
            </>
          )}
        </Button>
      </div>

      {lastAnalysis && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-800">
                آخر تحليل: {lastAnalysis.toLocaleString("ar-DZ", { 
                  dateStyle: "medium", 
                  timeStyle: "short" 
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {insights.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Brain className="w-20 h-20 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">لا توجد تحليلات حالياً</p>
            <p className="text-gray-400 text-sm">اضغط على "تحليل شامل" للحصول على رؤى ذكية</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Critical Priority */}
          {insights.filter((i) => i.priority === "critical").length > 0 && (
            <div>
              <h3 className="text-xl mb-3 text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                قضايا حرجة - تحتاج تدخل فوري
              </h3>
              <div className="space-y-3">
                {insights
                  .filter((i) => i.priority === "critical")
                  .map((insight) => (
                    <Card key={insight.id} className={getPriorityColor(insight.priority)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(insight.type)}
                            <div>
                              <CardTitle className="text-lg">{insight.title}</CardTitle>
                              <p className="text-sm text-gray-600 mt-1">{insight.category}</p>
                            </div>
                          </div>
                          {getPriorityBadge(insight.priority)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-gray-700">{insight.description}</p>
                        {insight.affectedFarmers && insight.affectedFarmers.length > 0 && (
                          <div className="bg-white/60 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              الفلاحون المتأثرون ({insight.affectedFarmers.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {insight.affectedFarmers.map((name, idx) => (
                                <span key={idx} className="px-3 py-1 bg-white rounded-full text-xs text-gray-700 border">
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* High Priority */}
          {insights.filter((i) => i.priority === "high").length > 0 && (
            <div>
              <h3 className="text-xl mb-3 text-orange-700 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                أولويات عالية
              </h3>
              <div className="space-y-3">
                {insights
                  .filter((i) => i.priority === "high")
                  .map((insight) => (
                    <Card key={insight.id} className={getPriorityColor(insight.priority)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(insight.type)}
                            <div>
                              <CardTitle className="text-lg">{insight.title}</CardTitle>
                              <p className="text-sm text-gray-600 mt-1">{insight.category}</p>
                            </div>
                          </div>
                          {getPriorityBadge(insight.priority)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-gray-700">{insight.description}</p>
                        {insight.affectedFarmers && insight.affectedFarmers.length > 0 && (
                          <div className="bg-white/60 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              الفلاحون المتأثرون ({insight.affectedFarmers.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {insight.affectedFarmers.map((name, idx) => (
                                <span key={idx} className="px-3 py-1 bg-white rounded-full text-xs text-gray-700 border">
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Medium Priority */}
          {insights.filter((i) => i.priority === "medium").length > 0 && (
            <div>
              <h3 className="text-xl mb-3 text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                توصيات للتحسين
              </h3>
              <div className="space-y-3">
                {insights
                  .filter((i) => i.priority === "medium")
                  .map((insight) => (
                    <Card key={insight.id} className={getPriorityColor(insight.priority)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(insight.type)}
                            <div>
                              <CardTitle className="text-lg">{insight.title}</CardTitle>
                              <p className="text-sm text-gray-600 mt-1">{insight.category}</p>
                            </div>
                          </div>
                          {getPriorityBadge(insight.priority)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-gray-700">{insight.description}</p>
                        {insight.affectedFarmers && insight.affectedFarmers.length > 0 && (
                          <div className="bg-white/60 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              الفلاحون المتأثرون ({insight.affectedFarmers.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {insight.affectedFarmers.map((name, idx) => (
                                <span key={idx} className="px-3 py-1 bg-white rounded-full text-xs text-gray-700 border">
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Low Priority */}
          {insights.filter((i) => i.priority === "low").length > 0 && (
            <div>
              <h3 className="text-xl mb-3 text-green-700 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                معلومات ونجاحات
              </h3>
              <div className="space-y-3">
                {insights
                  .filter((i) => i.priority === "low")
                  .map((insight) => (
                    <Card key={insight.id} className={getPriorityColor(insight.priority)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(insight.type)}
                            <div>
                              <CardTitle className="text-lg">{insight.title}</CardTitle>
                              <p className="text-sm text-gray-600 mt-1">{insight.category}</p>
                            </div>
                          </div>
                          {getPriorityBadge(insight.priority)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-gray-700">{insight.description}</p>
                        {insight.affectedFarmers && insight.affectedFarmers.length > 0 && (
                          <div className="bg-white/60 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              الفلاحون المعنيون ({insight.affectedFarmers.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {insight.affectedFarmers.map((name, idx) => (
                                <span key={idx} className="px-3 py-1 bg-white rounded-full text-xs text-gray-700 border">
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
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
