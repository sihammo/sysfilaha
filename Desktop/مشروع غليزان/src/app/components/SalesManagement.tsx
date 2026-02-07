import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Plus, Edit, Trash2, Calendar, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Sale {
  id: string;
  cropName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  buyerName: string;
  saleDate: string;
  paymentStatus: string;
}

interface SalesManagementProps {
  userId: string;
}

export default function SalesManagement({ userId }: SalesManagementProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    cropName: "",
    quantity: "",
    pricePerUnit: "",
    buyerName: "",
    saleDate: "",
    paymentStatus: "مدفوع",
  });

  useEffect(() => {
    const savedSales = localStorage.getItem(`sales_${userId}`);
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    }
  }, [userId]);

  const saveSales = (newSales: Sale[]) => {
    setSales(newSales);
    localStorage.setItem(`sales_${userId}`, JSON.stringify(newSales));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalPrice = Number(formData.quantity) * Number(formData.pricePerUnit);

    if (editingSale) {
      const updatedSales = sales.map((sale) =>
        sale.id === editingSale.id
          ? {
              ...editingSale,
              cropName: formData.cropName,
              quantity: Number(formData.quantity),
              pricePerUnit: Number(formData.pricePerUnit),
              totalPrice,
              buyerName: formData.buyerName,
              saleDate: formData.saleDate,
              paymentStatus: formData.paymentStatus,
            }
          : sale
      );
      saveSales(updatedSales);
      toast.success("تم تحديث عملية البيع بنجاح");
    } else {
      const newSale: Sale = {
        id: Date.now().toString(),
        cropName: formData.cropName,
        quantity: Number(formData.quantity),
        pricePerUnit: Number(formData.pricePerUnit),
        totalPrice,
        buyerName: formData.buyerName,
        saleDate: formData.saleDate,
        paymentStatus: formData.paymentStatus,
      };
      saveSales([...sales, newSale]);
      toast.success("تم إضافة عملية البيع بنجاح");
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      cropName: "",
      quantity: "",
      pricePerUnit: "",
      buyerName: "",
      saleDate: "",
      paymentStatus: "مدفوع",
    });
    setEditingSale(null);
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      cropName: sale.cropName,
      quantity: sale.quantity.toString(),
      pricePerUnit: sale.pricePerUnit.toString(),
      buyerName: sale.buyerName,
      saleDate: sale.saleDate,
      paymentStatus: sale.paymentStatus,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    saveSales(sales.filter((sale) => sale.id !== id));
    toast.success("تم حذف عملية البيع بنجاح");
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "مدفوع":
        return "bg-green-100 text-green-800";
      case "معلق":
        return "bg-yellow-100 text-yellow-800";
      case "متأخر":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const paidRevenue = sales.filter(s => s.paymentStatus === "مدفوع").reduce((sum, sale) => sum + sale.totalPrice, 0);
  const pendingRevenue = sales.filter(s => s.paymentStatus !== "مدفوع").reduce((sum, sale) => sum + sale.totalPrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-2 text-green-800">إدارة المبيعات</h2>
          <p className="text-gray-600">تتبع وإدارة جميع مبيعاتك</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة عملية بيع
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingSale ? "تعديل عملية البيع" : "إضافة عملية بيع جديدة"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cropName">اسم المحصول</Label>
                <Input
                  id="cropName"
                  value={formData.cropName}
                  onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                  required
                  placeholder="مثال: قمح"
                />
              </div>

              <div>
                <Label htmlFor="quantity">الكمية (قنطار)</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  placeholder="مثال: 50"
                />
              </div>

              <div>
                <Label htmlFor="pricePerUnit">السعر للقنطار (دج)</Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  step="0.01"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                  required
                  placeholder="مثال: 5000"
                />
              </div>

              <div>
                <Label htmlFor="buyerName">اسم المشتري</Label>
                <Input
                  id="buyerName"
                  value={formData.buyerName}
                  onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                  required
                  placeholder="مثال: أحمد بن علي"
                />
              </div>

              <div>
                <Label htmlFor="saleDate">تاريخ البيع</Label>
                <Input
                  id="saleDate"
                  type="date"
                  value={formData.saleDate}
                  onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="paymentStatus">حالة الدفع</Label>
                <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مدفوع">مدفوع</SelectItem>
                    <SelectItem value="معلق">معلق</SelectItem>
                    <SelectItem value="متأخر">متأخر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.quantity && formData.pricePerUnit && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">المبلغ الإجمالي</p>
                  <p className="text-2xl text-green-700">
                    {(Number(formData.quantity) * Number(formData.pricePerUnit)).toLocaleString()} دج
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                {editingSale ? "تحديث" : "إضافة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">إجمالي الإيرادات</CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-700">{totalRevenue.toLocaleString()} دج</div>
            <p className="text-xs text-gray-500 mt-1">{sales.length} عملية بيع</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">المدفوعات المستلمة</CardTitle>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-700">{paidRevenue.toLocaleString()} دج</div>
            <p className="text-xs text-gray-500 mt-1">تم الدفع</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">المدفوعات المعلقة</CardTitle>
            <Calendar className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-700">{pendingRevenue.toLocaleString()} دج</div>
            <p className="text-xs text-gray-500 mt-1">قيد الانتظار</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales List */}
      <div className="space-y-3">
        {sales.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">لا توجد عمليات بيع مسجلة</p>
              <p className="text-sm text-gray-400">ابدأ بإضافة عملية البيع الأولى</p>
            </CardContent>
          </Card>
        ) : (
          sales.map((sale) => (
            <Card key={sale.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">المحصول</p>
                      <p>{sale.cropName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">الكمية</p>
                      <p>{sale.quantity} قنطار</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">السعر</p>
                      <p>{sale.pricePerUnit.toLocaleString()} دج</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">المشتري</p>
                      <p>{sale.buyerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">التاريخ</p>
                      <p>{new Date(sale.saleDate).toLocaleDateString("ar-DZ")}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${getPaymentStatusColor(sale.paymentStatus)}`}>
                      {sale.paymentStatus}
                    </span>
                    <p className="text-lg text-green-700">{sale.totalPrice.toLocaleString()} دج</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(sale)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(sale.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}