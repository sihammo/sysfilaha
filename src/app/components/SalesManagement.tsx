import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  DollarSign,
  Search,
  User,
  ShoppingBag,
  ArrowDownRight,
  Coins,
  ChevronLeft
} from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../utils/cn";

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
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredSales = sales.filter(s =>
    s.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const totalPrice = Number(formData.quantity) * Number(formData.pricePerUnit);
      const payload = { ...formData, quantity: Number(formData.quantity), pricePerUnit: Number(formData.pricePerUnit), totalPrice };

      if (editingSale) {
        await api.farmer.updateSale(editingSale._id, payload);
        toast.success("تم تحديث الفاتورة");
      } else {
        await api.farmer.addSale(payload);
        toast.success("تم تسجيل عملية البيع بنجاح");
      }
      loadSales();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "فشل تسجيل العملية");
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
    if (confirm("هل أنت متأكد من حذف هذا السجل المالي؟")) {
      try {
        await api.farmer.deleteSale(id);
        toast.success("تم حذف السجل");
        loadSales();
      } catch (error: any) {
        toast.error("فشل حذف العملية");
      }
    }
  };

  const getPaymentStatusInfo = (status: string) => {
    switch (status) {
      case "مدفوع": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "معلق": return "bg-amber-50 text-amber-600 border-amber-100";
      case "متأخر": return "bg-rose-50 text-rose-600 border-rose-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const totalRevenue = sales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in-fade" dir="rtl">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">إدارة المبيعات</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">سجل العمليات التجارية وتتبع التدفقات المالية.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 shadow-xl shadow-primary/20 flex gap-2 font-black text-lg transition-all hover:scale-[1.02]">
              <Plus className="w-6 h-6" /> إضافة سجل بيع
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-[2.5rem] p-8" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900">
                {editingSale ? "تعديل بيانات البيع" : "تسجيل عملية بيع جديدة"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label className="font-bold">اسم المحصول المباع</Label>
                <Input value={formData.cropName} onChange={(e) => setFormData({ ...formData, cropName: e.target.value })} required className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200" placeholder="مثال: تمر دقلة نور" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">الكمية (قنطار)</Label>
                  <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">السعر للقنطار</Label>
                  <Input type="number" value={formData.pricePerUnit} onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })} required className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">المشتري / الجهة المستلمة</Label>
                <Input value={formData.buyerName} onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })} required className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200" placeholder="اسم التاجر أو الشركة" />
              </div>

              <div className="space-y-2">
                <Label className="font-bold">تاريخ العملية</Label>
                <Input type="date" value={formData.saleDate} onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })} required className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200" />
              </div>

              <Button type="submit" className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl rounded-2xl shadow-xl shadow-primary/20">
                {editingSale ? "حفظ التعديلات" : "إتمام التسجيل المالي"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Revenue Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none bg-emerald-600 text-white rounded-[2rem] shadow-xl shadow-emerald-500/20 overflow-hidden relative group">
          <div className="absolute top-[-20%] right-[-10%] opacity-10 rotate-12 transition-transform group-hover:scale-110">
            <TrendingUp size={180} />
          </div>
          <CardContent className="p-8 relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-md">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <p className="text-white/80 font-bold text-sm uppercase tracking-wider">إجمالي المداخيل المسجلة</p>
            <h3 className="text-4xl font-black mt-1 leading-none">{totalRevenue.toLocaleString()} <span className="text-lg opacity-70">دج</span></h3>
          </CardContent>
        </Card>

        <Card className="border-none bg-white rounded-[2rem] shadow-sm flex items-center p-8 gap-6 border border-slate-100">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
            <ShoppingBag className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <p className="text-slate-400 font-bold text-sm uppercase">عدد العمليات</p>
            <h3 className="text-3xl font-black text-slate-900">{sales.length}</h3>
          </div>
        </Card>

        <Card className="border-none bg-white rounded-[2rem] shadow-sm flex items-center p-8 gap-6 border border-slate-100">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <p className="text-slate-400 font-bold text-sm uppercase">كبار المشترين</p>
            <h3 className="text-xl font-black text-slate-900 truncate max-w-[150px]">سوق الجملة</h3>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن فاتورة بالاسم أو المشتري..."
            className="w-full pr-12 pl-4 py-3 bg-transparent border-none outline-none font-medium"
          />
        </div>
      </div>

      {/* Sales Transactions List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredSales.map((sale) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={sale._id}
            >
              <Card className="border-none bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6 relative">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition-colors">
                      <DollarSign className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-xl font-black text-slate-900 leading-none">{sale.cropName}</h4>
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border", getPaymentStatusInfo(sale.paymentStatus))}>
                          {sale.paymentStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-slate-500 font-medium flex items-center gap-1"><User className="w-3 h-3" /> {sale.buyerName}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400 font-bold">{sale.quantity} قنطار</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400 font-bold">{new Date(sale.saleDate).toLocaleDateString('ar-DZ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 pr-4">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">القيمة الإجمالية</p>
                      <p className="text-2xl font-black text-emerald-700">{(sale.totalPrice || 0).toLocaleString()} <span className="text-xs">دج</span></p>
                    </div>
                    <div className="flex gap-2 border-r border-slate-100 pr-6">
                      <Button onClick={() => handleEdit(sale)} variant="ghost" className="w-10 h-10 p-0 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => handleDelete(sale._id)} variant="ghost" className="w-10 h-10 p-0 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredSales.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100 opacity-60">
            <Coins className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-lg font-bold text-slate-400">لا توجد سجلات مبيعات متاحة</p>
          </div>
        )}
      </div>
    </div>
  );
}