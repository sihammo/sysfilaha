import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Loader, TrendingUp, Coins, Leaf, Search, Activity, Heart, Scale, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { toast } from 'sonner';
import api from '../utils/api';
import { Skeleton } from "./ui/skeleton";
import { cn } from "../utils/cn";

interface Livestock {
  _id: string;
  type: string;
  quantity: number;
  age: string;
  health: string;
  purpose: string;
  productType: string;
  weight: string;
  unitPrice: number;
  monthlyFeedCost: number;
  notes: string;
  dateAdded: string;
}

interface LivestockManagementProps {
  farmerId: string;
}

const LIVESTOCK_TYPES = ['أبقار', 'أغنام', 'ماعز', 'دجاج', 'إوز', 'خيول', 'حمير', 'جمال'];
const HEALTH_STATUS = ['سليم', 'بحاجة للمراقبة', 'مريض', 'تحت العلاج'];
const PURPOSE_OPTIONS = ['تربية', 'إنتاج', 'بيع', 'استهلاك شخصي', 'سحب'];

export default function LivestockManagement({ farmerId }: LivestockManagementProps) {
  const [livestocks, setLivestocks] = useState<Livestock[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    type: '',
    quantity: '',
    age: '',
    health: 'سليم',
    purpose: '',
    productType: '',
    weight: '',
    unitPrice: '',
    monthlyFeedCost: '',
    notes: '',
  });

  useEffect(() => {
    loadLivestock();
  }, [farmerId]);

  const loadLivestock = async () => {
    try {
      setIsLoading(true);
      const data = await api.farmer.getLivestock();
      setLivestocks(data);
    } catch (e) {
      toast.error("فشل تحميل المواشي");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        unitPrice: parseFloat(formData.unitPrice) || 0,
        monthlyFeedCost: parseFloat(formData.monthlyFeedCost) || 0,
      };

      if (editingId) {
        await api.farmer.updateLivestock(editingId, payload);
        toast.success("تم تحديث السجل بنجاح");
      } else {
        await api.farmer.addLivestock(payload);
        toast.success('تمت إضافة المواشي للمستثمرة');
      }
      loadLivestock();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "فشل العملية");
    }
  };

  const handleEdit = (livestock: Livestock) => {
    setFormData({
      type: livestock.type,
      quantity: livestock.quantity.toString(),
      age: livestock.age,
      health: livestock.health,
      purpose: livestock.purpose,
      productType: livestock.productType,
      weight: livestock.weight,
      unitPrice: livestock.unitPrice.toString(),
      monthlyFeedCost: livestock.monthlyFeedCost.toString(),
      notes: livestock.notes,
    });
    setEditingId(livestock._id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل تريد حذف هذا السجل الحيواني؟")) {
      try {
        await api.farmer.deleteLivestock(id);
        toast.success("تم الحذف بنجاح");
        loadLivestock();
      } catch (error: any) {
        toast.error("فشل الحذف");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
      quantity: '',
      age: '',
      health: 'سليم',
      purpose: '',
      productType: '',
      weight: '',
      unitPrice: '',
      monthlyFeedCost: '',
      notes: '',
    });
    setEditingId(null);
  };

  const filteredLivestock = livestocks.filter(ls =>
    ls.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ls.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalLivestock = livestocks.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalValue = livestocks.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in-fade" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">إدارة الثروة الحيوانية</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">متابعة القطيع، الحالة الصحية، وتكاليف التربية.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl px-6 shadow-xl shadow-amber-600/20 flex gap-2 font-black transition-all hover:scale-[1.02]">
              <Plus className="w-6 h-6" /> إضافة مواشي
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-[2.5rem] p-8" dir="rtl">
            <DialogHeader><DialogTitle className="text-2xl font-black">{editingId ? 'تحديث السجلات' : 'إضافة مواشي جديدة'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">نوع الحيوان</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v }))}>
                    <SelectTrigger className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200"><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                    <SelectContent>{LIVESTOCK_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">العدد (رؤوس)</Label>
                  <Input name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} required className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">الحالة الصحية</Label>
                  <Select value={formData.health} onValueChange={(v) => setFormData(p => ({ ...p, health: v }))}>
                    <SelectTrigger className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>{HEALTH_STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">الغرض من التربية</Label>
                  <Select value={formData.purpose} onValueChange={(v) => setFormData(p => ({ ...p, purpose: v }))}>
                    <SelectTrigger className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200"><SelectValue placeholder="اختر الغرض" /></SelectTrigger>
                    <SelectContent>{PURPOSE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">القيمة التقديرية (للرأس)</Label>
                  <Input name="unitPrice" type="number" value={formData.unitPrice} onChange={handleInputChange} className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">تكلفة العلف شهرياً</Label>
                  <Input name="monthlyFeedCost" type="number" value={formData.monthlyFeedCost} onChange={handleInputChange} className="h-14 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200" />
                </div>
              </div>

              <Button type="submit" className="w-full h-16 bg-amber-600 hover:bg-amber-700 text-white font-black text-xl rounded-2xl">
                {editingId ? 'حفظ التغييرات' : 'تأكيد الإضافة'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard label="إجمالي القطيع" value={totalLivestock} unit="رأس" color="amber" icon={Activity} />
        <StatsCard label="الأنواع المختلفة" value={livestocks.length} unit="نوع" color="blue" icon={Leaf} />
        <StatsCard label="القيمة السوقية" value={totalValue.toLocaleString()} unit="دج" color="emerald" icon={Coins} />
        <StatsCard label="الحالة الصحية" value="94%" unit="سليم" color="rose" icon={Heart} />
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن نوع أو غرض..."
          className="w-full pr-14 pl-6 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-amber-500/10 font-bold"
        />
      </div>

      {/* Livestock Cards List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredLivestock.map((ls) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              key={ls._id}
            >
              <Card className="border-none bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-all group overflow-hidden border border-slate-50">
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Activity className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-2xl font-black text-slate-900">{ls.type}</h4>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase border",
                          ls.health === "سليم" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                          {ls.health}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-lg">{ls.purpose}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-amber-600 font-black text-lg">{ls.quantity} <span className="text-xs text-slate-400 font-bold">رأس</span></span>
                        {ls.age && <>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-400 font-bold">{ls.age}</span>
                        </>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-10">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">تخمين القيمة</p>
                      <p className="text-2xl font-black text-slate-900">{(ls.quantity * ls.unitPrice).toLocaleString()} <span className="text-xs">دج</span></p>
                    </div>
                    <div className="flex gap-2 border-r border-slate-100 pr-6">
                      <Button onClick={() => handleEdit(ls)} variant="ghost" className="w-12 h-12 p-0 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all">
                        <Edit2 className="w-5 h-5" />
                      </Button>
                      <Button onClick={() => handleDelete(ls._id)} variant="ghost" className="w-12 h-12 p-0 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredLivestock.length === 0 && (
        <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100 opacity-60">
          <Activity className="w-20 h-20 text-slate-100 mx-auto mb-6" />
          <p className="text-xl font-bold text-slate-300">لا توجد سجلات مطابقة في قاعدة البيانات</p>
        </div>
      )}
    </div>
  );
}

function StatsCard({ label, value, unit, color, icon: Icon }: any) {
  const themes: any = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100"
  };
  return (
    <Card className={cn("border shadow-sm p-6 rounded-[2rem] flex items-center gap-5", themes[color])}>
      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase opacity-70 mb-1 leading-none">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tight">{value}</span>
          <span className="text-[10px] font-bold opacity-60">{unit}</span>
        </div>
      </div>
    </Card>
  );
}
