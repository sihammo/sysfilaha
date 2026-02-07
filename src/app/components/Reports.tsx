import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FileText, Download, TrendingUp, DollarSign, Sprout, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

interface ReportsProps {
  userId: string;
}

export default function Reports({ userId }: ReportsProps) {
  const [reportType, setReportType] = useState("overview");
  const [crops, setCrops] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);

  useEffect(() => {
    const savedCrops = localStorage.getItem(`crops_${userId}`);
    const savedSales = localStorage.getItem(`sales_${userId}`);
    const savedWorkers = localStorage.getItem(`workers_${userId}`);
    
    if (savedCrops) setCrops(JSON.parse(savedCrops));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedWorkers) setWorkers(JSON.parse(savedWorkers));
  }, [userId]);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalExpenses = workers.reduce((sum, worker) => sum + worker.salary, 0);
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
    acc[month] = (acc[month] || 0) + sale.totalPrice;
    return acc;
  }, {});

  const salesData = Object.entries(salesByMonth).map(([month, total]) => ({
    month,
    مبيعات: total,
  }));

  const handleExportPDF = () => {
    alert("سيتم تصدير التقرير إلى PDF قريباً");
  };

  const handleExportExcel = () => {
    alert("سيتم تصدير التقرير إلى Excel قريباً");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-2 text-green-800">التقارير والإحصائيات</h2>
          <p className="text-gray-600">تحليل شامل لنشاطك الفلاحي</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            تصدير PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            تصدير Excel
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-4 items-center">
        <label className="text-sm">نوع التقرير:</label>
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">نظرة عامة</SelectItem>
            <SelectItem value="crops">تقرير المحاصيل</SelectItem>
            <SelectItem value="sales">تقرير المبيعات</SelectItem>
            <SelectItem value="financial">التقرير المالي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Report */}
      {reportType === "overview" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-gray-600">إجمالي المحاصيل</CardTitle>
                <Sprout className="w-5 h-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-green-700">{crops.length}</div>
                <p className="text-xs text-gray-500 mt-1">محصول نشط</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-gray-600">إجمالي المبيعات</CardTitle>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-blue-700">{totalRevenue.toLocaleString()} دج</div>
                <p className="text-xs text-gray-500 mt-1">{sales.length} عملية بيع</p>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-gray-600">إجمالي المصروفات</CardTitle>
                <DollarSign className="w-5 h-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-red-700">{totalExpenses.toLocaleString()} دج</div>
                <p className="text-xs text-gray-500 mt-1">رواتب العمال</p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-gray-600">صافي الربح</CardTitle>
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {netProfit.toLocaleString()} دج
                </div>
                <p className="text-xs text-gray-500 mt-1">الفترة الحالية</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>المحاصيل حسب النوع</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cropTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="عدد" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المبيعات الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="مبيعات" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Crops Report */}
      {reportType === "crops" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل المحاصيل</CardTitle>
            </CardHeader>
            <CardContent>
              {crops.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد محاصيل مسجلة</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3">المحصول</th>
                        <th className="text-right py-3">النوع</th>
                        <th className="text-right py-3">المساحة</th>
                        <th className="text-right py-3">الحالة</th>
                        <th className="text-right py-3">الإنتاج المتوقع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crops.map((crop) => (
                        <tr key={crop.id} className="border-b">
                          <td className="py-3">{crop.name}</td>
                          <td className="py-3">{crop.type}</td>
                          <td className="py-3">{crop.area} هكتار</td>
                          <td className="py-3">{crop.status}</td>
                          <td className="py-3">{crop.expectedYield} قنطار</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>المحاصيل حسب النوع</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={cropTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="عدد" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sales Report */}
      {reportType === "sales" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل المبيعات</CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد مبيعات مسجلة</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3">المحصول</th>
                        <th className="text-right py-3">الكمية</th>
                        <th className="text-right py-3">السعر</th>
                        <th className="text-right py-3">المشتري</th>
                        <th className="text-right py-3">التاريخ</th>
                        <th className="text-right py-3">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale) => (
                        <tr key={sale.id} className="border-b">
                          <td className="py-3">{sale.cropName}</td>
                          <td className="py-3">{sale.quantity} قنطار</td>
                          <td className="py-3">{sale.pricePerUnit.toLocaleString()} دج</td>
                          <td className="py-3">{sale.buyerName}</td>
                          <td className="py-3">{new Date(sale.saleDate).toLocaleDateString("ar-DZ")}</td>
                          <td className="py-3 text-green-700">{sale.totalPrice.toLocaleString()} دج</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>المبيعات الشهرية</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="مبيعات" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Report */}
      {reportType === "financial" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle>الإيرادات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-green-700">{totalRevenue.toLocaleString()} دج</div>
                <p className="text-sm text-gray-500 mt-2">من {sales.length} عملية بيع</p>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle>المصروفات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-red-700">{totalExpenses.toLocaleString()} دج</div>
                <p className="text-sm text-gray-500 mt-2">رواتب {workers.length} عامل</p>
              </CardContent>
            </Card>

            <Card className={netProfit >= 0 ? "border-green-200" : "border-red-200"}>
              <CardHeader>
                <CardTitle>صافي الربح</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {netProfit.toLocaleString()} دج
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {netProfit >= 0 ? "ربح" : "خسارة"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الرواتب</CardTitle>
            </CardHeader>
            <CardContent>
              {workers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا يوجد عمال مسجلون</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3">الاسم</th>
                        <th className="text-right py-3">الوظيفة</th>
                        <th className="text-right py-3">الراتب الشهري</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workers.map((worker) => (
                        <tr key={worker.id} className="border-b">
                          <td className="py-3">{worker.name}</td>
                          <td className="py-3">{worker.role}</td>
                          <td className="py-3">{worker.salary.toLocaleString()} دج</td>
                        </tr>
                      ))}
                      <tr className="border-t-2">
                        <td className="py-3"></td>
                        <td className="py-3">الإجمالي</td>
                        <td className="py-3 text-red-700">{totalExpenses.toLocaleString()} دج</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}