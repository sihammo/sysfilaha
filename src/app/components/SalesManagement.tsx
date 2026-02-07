import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Plus, Edit, Trash2, Calendar, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";

interface Sale {
  _id: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    cropName: "",
    quantity: "",
    pricePerUnit: "",
    buyerName: "",
    saleDate: "",
    paymentStatus: "مدفوع",
  });

  useEffect(() => {
    loadSales();
  }, [userId]);

  const loadSales = async () => {
    try {
      setIsLoading(true);
      const data = await api.farmer.getSales();
      setSales(data);
    } catch (e) {
      toast.error("فشل تحميل المبيعات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const totalPrice = Number(formData.quantity) * Number(formData.pricePerUnit);
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        pricePerUnit: Number(formData.pricePerUnit),
        totalPrice
      };

      if (editingSale) {
        await api.farmer.updateSale(editingSale._id, payload);
        toast.success("تم تحديث عملية البيع بنجاح");
      } else {
        await api.farmer.addSale(payload);
        toast.success("تم إضافة عملية البيع بنجاح");
      }
      loadSales();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "فشل العملية");
    }
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
      saleDate: sale.saleDate ? sale.saleDate.split('T')[0] : "",
      paymentStatus: sale.paymentStatus,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه العملية؟")) {
      try {
        await api.farmer.deleteSale(id);
        toast.success("تم الحذف بنجاح");
        loadSales();
      } catch (error: any) {
        toast.error("فشل الحذف");
      }
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "مدفوع": return "bg-green-100 text-green-800";
      case "معلق": return "bg-yellow-100 text-yellow-800";
      case "متأخر": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalRevenue = sales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);

  if (isLoading) return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;

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
            <DialogHeader><DialogTitle>{editingSale ? "تعديل عملية البيع" : "إضافة عملية بيع جديدة"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label htmlFor="cropName">اسم المحصول</Label><Input id="cropName" value={formData.cropName} onChange={(e) => setFormData({ ...formData, cropName: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label htmlFor="quantity">الكمية</Label><Input id="quantity" type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required /></div>
                <div><Label htmlFor="pricePerUnit">السعر للقنطار</Label><Input id="pricePerUnit" type="number" value={formData.pricePerUnit} onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })} required /></div>
              </div>
              <div><Label htmlFor="buyerName">المشتري</Label><Input id="buyerName" value={formData.buyerName} onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })} required /></div>
              <div><Label htmlFor="saleDate">التاريخ</Label><Input id="saleDate" type="date" value={formData.saleDate} onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })} required /></div>
              <Button type="submit" className="w-full bg-green-600">{editingSale ? "تحديث" : "إضافة"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200"><CardHeader className="pb-2 text-sm text-gray-600">إجمالي المبيعات</CardHeader><CardContent><div className="text-2xl text-green-700">{totalRevenue.toLocaleString()} دج</div></CardContent></Card>
      </div>

      <div className="space-y-3">
        {sales.map((sale) => (
          <Card key={sale._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold">{sale.cropName} - {sale.buyerName}</p>
                <p className="text-sm text-gray-500">{sale.quantity} قنطار × {sale.pricePerUnit.toLocaleString()} دج</p>
                <p className="text-xs text-gray-400">{new Date(sale.saleDate).toLocaleDateString("ar-DZ")}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-xs ${getPaymentStatusColor(sale.paymentStatus)}`}>{sale.paymentStatus}</span>
                <p className="text-lg font-bold text-green-700">{(sale.totalPrice || 0).toLocaleString()} دج</p>
                <Button onClick={() => handleEdit(sale)} variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                <Button onClick={() => handleDelete(sale._id)} variant="ghost" size="sm" className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}