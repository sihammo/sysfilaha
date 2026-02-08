import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  UserCheck,
  Users,
  Check,
  X,
  Search,
  Filter,
  ChevronRight,
  Clock,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../utils/cn";

interface Farmer {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  farmerCardNumber?: string;
  role: string;
  password?: string;
  approved?: boolean;
  phone?: string;
  email?: string;
  address?: string;
  landArea?: string;
  region?: string;
  crops?: string;
  status?: "pending" | "approved" | "rejected";
  registrationDate?: string;
}

export default function AdminFarmersManagement() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Farmer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    farmerCardNumber: "",
    password: "",
  });

  useEffect(() => {
    loadFarmers();
  }, []);

  const loadFarmers = async () => {
    try {
      setIsLoading(true);
      const data = await api.admin.getFarmers();
      const approved = data.filter((f: Farmer) => f.status === "approved" || f.approved);
      const pending = data.filter((f: Farmer) => f.status === "pending" && !f.approved);
      setFarmers(approved);
      setPendingRequests(pending);
    } catch (error: any) {
      toast.error(error.message || "Failed to load farmers");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFarmers = farmers.filter(f =>
    `${f.firstName} ${f.lastName} ${f.nationalId}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFarmer) {
        await api.admin.updateFarmer(editingFarmer._id, formData);
        toast.success("تم تحديث بيانات الفلاح بنجاح");
      } else {
        await api.auth.register({ ...formData, status: 'approved', approved: true });
        toast.success("تم إضافة الفلاح بنجاح");
      }
      loadFarmers();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to save farmer");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.admin.updateStatus(id, "approved");
      loadFarmers();
      toast.success("تم الموافقة على طلب التسجيل بنجاح");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    if (confirm("هل أنت متأكد من رفض هذا الطلب؟")) {
      try {
        await api.admin.updateStatus(id, "rejected");
        loadFarmers();
        toast.success("تم رفض الطلب بنجاح");
      } catch (error: any) {
        toast.error(error.message || "Failed to reject");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("تحذير: هذا سيحذف جميع بيانات هذا الفلاح نهائياً. هل أنت متأكد؟")) {
      try {
        await api.admin.deleteFarmer(id);
        toast.success("تم الحذف بنجاح");
        loadFarmers();
      } catch (error: any) {
        toast.error("فشل حذف الفلاح");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      nationalId: "",
      farmerCardNumber: "",
      password: "",
    });
    setEditingFarmer(null);
  };

  const handleEdit = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setFormData({
      firstName: farmer.firstName,
      lastName: farmer.lastName,
      nationalId: farmer.nationalId,
      farmerCardNumber: farmer.farmerCardNumber || "",
      password: "",
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in-fade" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">إدارة الفلاحين</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">قاعدة البيانات الموحدة للفلاحين والمنتجين الزراعين.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              placeholder="ابحث بالاسم أو رقم التعريف..."
              className="pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-80 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-medium transition-all"
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-6 shadow-xl shadow-emerald-500/20 flex gap-2 font-bold transition-all hover:scale-[1.02]">
                <Plus className="w-5 h-5" />
                تسجيل فلاح جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-900">
                  {editingFarmer ? "تعديل البيانات" : "تسجيل فلاح جديد"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الاسم</Label>
                    <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>اللقب</Label>
                    <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required className="h-12 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>رقم التعريف الوطني</Label>
                  <Input value={formData.nationalId} onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })} required disabled={!!editingFarmer} className="h-12 rounded-xl font-mono" />
                </div>

                <div className="space-y-2">
                  <Label>رقم بطاقة الفلاح (اختياري)</Label>
                  <Input value={formData.farmerCardNumber} onChange={(e) => setFormData({ ...formData, farmerCardNumber: e.target.value })} className="h-12 rounded-xl" />
                </div>

                {!editingFarmer && (
                  <div className="space-y-2">
                    <Label>كلمة المرور المسجلة</Label>
                    <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className="h-12 rounded-xl" />
                  </div>
                )}

                <Button type="submit" className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl">
                  {editingFarmer ? "حفظ التعديلات" : "إتمام التسجيل"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewCard icon={Users} label="إجمالي المسجلين" value={farmers.length + pendingRequests.length} color="emerald" />
        <OverviewCard icon={Clock} label="طلبات معلقة" value={pendingRequests.length} color="amber" />
        <OverviewCard icon={ShieldCheck} label="نشطون حالياً" value={farmers.length} color="blue" />
      </div>

      {/* Pending Requests Section */}
      <AnimatePresence>
        {pendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">طلبات انتظار المراجعة</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.map((request) => (
                <motion.div key={request._id} layoutId={request._id}>
                  <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white/60 backdrop-blur-md border border-amber-200/50 group">
                    <div className="h-2 w-full bg-amber-400" />
                    <CardHeader className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-bold text-slate-900">{request.firstName} {request.lastName}</CardTitle>
                          <p className="text-xs font-bold text-amber-600 mt-1 uppercase tracking-wider italic">بانتظار الموافقة الرسمية</p>
                        </div>
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 rounded-lg py-1">قيد المراجعة</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-4">
                      <div className="space-y-3">
                        <InfoRow icon={Mail} label="البريد" value={request.email || "غير متوفر"} />
                        <InfoRow icon={Phone} label="الهاتف" value={request.phone || "غير متوفر"} />
                        <InfoRow icon={MapPin} label="الولاية" value={request.region || "غير محددة"} />
                      </div>
                      <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <Button onClick={() => handleApprove(request._id)} className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex gap-2">
                          <Check className="w-4 h-4" /> قبول
                        </Button>
                        <Button onClick={() => handleReject(request._id)} variant="ghost" className="flex-1 h-12 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold flex gap-2">
                          <X className="w-4 h-4" /> رفض
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Farmers List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">قائمة الفلاحين المعتمدين</h3>
          <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">تحديث تلقائي</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarmers.length === 0 ? (
            <div className="col-span-full py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center opacity-70">
              <Users className="w-20 h-20 text-slate-300 mb-6 font-thin" />
              <p className="text-xl font-bold text-slate-400">لا يوجد فلاحين مطابقين للبحث حالياً</p>
            </div>
          ) : (
            filteredFarmers.map((farmer) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={farmer._id}
              >
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white rounded-[2rem] overflow-hidden group hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <UserCheck className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-slate-900">{farmer.firstName} {farmer.lastName}</h4>
                          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{farmer.region || "ولاية غير محددة"}</p>
                        </div>
                      </div>
                      <div className="p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                        <Eye className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                    </div>

                    <div className="bg-slate-50/50 rounded-2xl p-5 space-y-3 border border-slate-50 group-hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-bold">رقم التعريف</span>
                        <span className="text-slate-900 font-mono font-bold tracking-tight">{farmer.nationalId}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-bold">بطاقة الفلاح</span>
                        <span className="text-slate-600 font-bold">{farmer.farmerCardNumber || "—"}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button onClick={() => handleEdit(farmer)} variant="outline" className="flex-1 h-12 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-xl font-bold transition-all">
                        تعديل البيانات
                      </Button>
                      <Button onClick={() => handleDelete(farmer._id)} variant="ghost" className="w-12 h-12 bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl p-0 transition-all">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ icon: Icon, label, value, color }: any) {
  const themes: any = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100"
  };
  return (
    <Card className={cn("border shadow-sm p-6 rounded-3xl flex items-center gap-6", themes[color])}>
      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm font-bold opacity-70 mb-1">{label}</p>
        <p className="text-3xl font-black tracking-tight">{value}</p>
      </div>
    </Card>
  );
}

function InfoRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
      <span className="text-slate-400 font-medium w-16 whitespace-nowrap">{label}: </span>
      <span className="text-slate-700 font-bold truncate">{value}</span>
    </div>
  );
}
