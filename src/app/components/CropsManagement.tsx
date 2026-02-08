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
  Sprout,
  Search,
  Filter,
  ArrowUpRight,
  Scale,
  Clock,
  ChevronLeft
} from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../utils/cn";

interface Crop {
  _id: string;
  name: string;
  type: string;
  area: number;
  plantingDate: string;
  harvestDate: string;
  status: string;
  expectedYield: number;
}

interface CropsManagementProps {
  userId: string;
}

export default function CropsManagement({ userId }: CropsManagementProps) {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    area: "",
    plantingDate: "",
    harvestDate: "",
    status: "مزروع",
    expectedYield: "",
  });

  useEffect(() => {
    loadCrops();
  }, [userId]);

  const loadCrops = async () => {
    try {
      setIsLoading(true);
      const data = await api.farmer.getCrops();
      setCrops(data);
    } catch (e) {
      toast.error("فشل تحميل المحاصيل");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCrops = crops.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        area: Number(formData.area),
        expectedYield: Number(formData.expectedYield),
      };

      if (editingCrop) {
        await api.farmer.updateCrop(editingCrop._id, payload);
        toast.success("تم تحديث بيانات المحصول");
      } else {
        await api.farmer.addCrop(payload);
        toast.success("تمت إضافة المحصول الجديد بنجاح");
      }
      loadCrops();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "فشل تسجيل العملية");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      area: "",
      plantingDate: "",
      harvestDate: "",
      status: "مزروع",
      expectedYield: "",
    });
    setEditingCrop(null);
  };

  const handleEdit = (crop: Crop) => {
    setEditingCrop(crop);
    setFormData({
      name: crop.name,
      type: crop.type,
      area: crop.area.toString(),
      plantingDate: crop.plantingDate ? crop.plantingDate.split('T')[0] : "",
      harvestDate: crop.harvestDate ? crop.harvestDate.split('T')[0] : "",
      status: crop.status,
      expectedYield: crop.expectedYield.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل تريد حقاً إزالة هذا المحصول من السجلات؟")) {
      try {
        await api.farmer.deleteCrop(id);
        toast.success("تم حذف السجل");
        loadCrops();
      } catch (error: any) {
        toast.error("فشل حذف المحصول");
      }
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "مزروع": return { color: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "مرحلة النمو" };
      case "جاهز للحصاد": return { color: "bg-amber-50 text-amber-700 border-amber-100", label: "جاهز للحصاد" };
      case "تم الحصاد": return { color: "bg-blue-50 text-blue-700 border-blue-100", label: "تم الحصاد" };
      default: return { color: "bg-slate-50 text-slate-700 border-slate-100", label: status };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-end">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-[2rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in-fade" dir="rtl">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">إدارة المحاصيل</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">تتبع دورات حياة المحاصيل وتوقعات الإنتاج.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              placeholder="ابحث عن المحصول..."
              className="pr-12 pl-4 py-3 bg-white border border-slate-100 rounded-2xl w-full md:w-64 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-6 shadow-xl shadow-emerald-500/20 flex gap-2 font-bold transition-all hover:scale-[1.02]">
                <Plus className="w-5 h-5" />
                إضافة محصول
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-[2.5rem] p-8" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-900">
                  {editingCrop ? "تحديث بيانات المحصول" : "تسجيل محصول جديد"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label className="font-bold">اسم المحصول</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200" placeholder="مثال: قمح صلب" />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">نوع التصنيف</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200"><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="حبوب">حبوب</SelectItem>
                      <SelectItem value="خضرووات">خضروات</SelectItem>
                      <SelectItem value="فواكه">فواكه</SelectItem>
                      <SelectItem value="بقوليات">بقوليات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">المساحة (هكتار)</Label>
                    <Input type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} required className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">الإنتاج المتوقع</Label>
                    <Input type="number" value={formData.expectedYield} onChange={(e) => setFormData({ ...formData, expectedYield: e.target.value })} required className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-xs capitalize">تاريخ الزراعة</Label>
                    <Input type="date" value={formData.plantingDate} onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })} required className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-xs capitalize">تاريخ الحصاد</Label>
                    <Input type="date" value={formData.harvestDate} onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })} required className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200" />
                  </div>
                </div>

                <Button type="submit" className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-emerald-500/20">
                  {editingCrop ? "حفظ التغييرات" : "تأكيد الإضافة"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Crops Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredCrops.map((crop) => {
            const status = getStatusInfo(crop.status);
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={crop._id}
              >
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white rounded-[2.5rem] overflow-hidden group hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-50 border border-emerald-100/50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Sprout className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-slate-900 leading-tight">{crop.name}</h4>
                          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tight">{crop.type}</p>
                        </div>
                      </div>
                      <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-center border shadow-sm", status.color)}>
                        {status.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-50/50">
                        <Scale className="w-5 h-5 text-emerald-500 mb-2" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">المساحة</p>
                        <p className="text-xl font-black text-slate-900">{crop.area}<span className="text-xs ml-1 font-bold text-slate-400">هكتار</span></p>
                      </div>
                      <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-50/50">
                        <ArrowUpRight className="w-5 h-5 text-blue-500 mb-2" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">الإنتاج المتوقع</p>
                        <p className="text-xl font-black text-slate-900">{crop.expectedYield}<span className="text-xs ml-1 font-bold text-slate-400">قنطار</span></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mb-8 px-2">
                      <Clock className="w-4 h-4" />
                      <span>يتوقع الحصاد في:</span>
                      <span className="text-slate-900">{new Date(crop.harvestDate).toLocaleDateString('ar-DZ')}</span>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={() => handleEdit(crop)} variant="outline" className="flex-1 h-12 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-xl font-bold transition-all">
                        تعديل السجل
                      </Button>
                      <Button onClick={() => handleDelete(crop._id)} variant="ghost" className="w-12 h-12 bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl p-0 transition-all">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredCrops.length === 0 && (
        <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <Sprout className="w-20 h-20 text-slate-200 mx-auto mb-6" />
          <p className="text-xl font-black text-slate-300">لم يتم العثور على محاصيل مسجلة مطابق للبحث</p>
        </div>
      )}
    </div>
  );
}