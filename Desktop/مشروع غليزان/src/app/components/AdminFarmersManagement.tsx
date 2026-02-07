import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Plus, Edit, Trash2, UserCheck, Users, Clock, CheckCircle, XCircle, UserX } from "lucide-react";
import { toast } from "sonner";

interface Farmer {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  farmerCardNumber: string;
  role: string;
  password: string;
  status: "approved" | "pending" | "rejected";
  createdAt?: string;
}

export default function AdminFarmersManagement() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [pendingFarmers, setPendingFarmers] = useState<Farmer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [activeTab, setActiveTab] = useState("active");

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

  const loadFarmers = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const farmerUsers = users.filter((u: Farmer) => u.role === "farmer");
    setFarmers(farmerUsers.filter((u: Farmer) => u.status === "approved"));
    setPendingFarmers(farmerUsers.filter((u: Farmer) => u.status === "pending"));
  };

  const handleStatusUpdate = (id: string, newStatus: "approved" | "rejected") => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = users.map((u: any) =>
      u.id === id ? { ...u, status: newStatus } : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    toast.success(newStatus === "approved" ? "تم تفعيل حساب الفلاح بنجاح" : "تم رفض طلب التسجيل");
    loadFarmers();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (editingFarmer) {
      const updatedUsers = users.map((u: Farmer) =>
        u.id === editingFarmer.id ? { ...u, ...formData } : u
      );
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      toast.success("تم تحديث بيانات الفلاح بنجاح");
    } else {
      const exists = users.some(
        (u: Farmer) => u.nationalId === formData.nationalId || (formData.farmerCardNumber && u.farmerCardNumber === formData.farmerCardNumber)
      );

      if (exists) {
        toast.error("رقم بطاقة التعريف أو رقم بطاقة الفلاح موجود مسبقاً");
        return;
      }

      const newFarmer: Farmer = {
        id: `farmer-${Date.now()}`,
        ...formData,
        role: "farmer",
        status: "approved", // Admins create already approved farmers
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("users", JSON.stringify([...users, newFarmer]));
      toast.success("تم إضافة الفلاح بنجاح");
    }

    loadFarmers();
    setIsDialogOpen(false);
    resetForm();
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
      farmerCardNumber: farmer.farmerCardNumber,
      password: farmer.password,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الفلاح؟ سيتم حذف جميع بياناته.")) {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const updatedUsers = users.filter((u: Farmer) => u.id !== id);
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      localStorage.removeItem(`crops_${id}`);
      localStorage.removeItem(`sales_${id}`);
      localStorage.removeItem(`resources_${id}`);

      loadFarmers();
      toast.success("تم حذف الفلاح وجميع بياناته بنجاح");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">إدارة الفلاحين</h2>
          <p className="text-slate-500 mt-1">المصادقة على الطلبات وإدارة الحسابات</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-[var(--admin-green-trust)] hover:opacity-90 rounded-xl px-6">
              <Plus className="w-4 h-4 ml-2" />
              إضافة فلاح يدوياً
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingFarmer ? "تعديل بيانات الفلاح" : "تسجيل فلاح جديد"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم</Label>
                  <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">اللقب</Label>
                  <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationalId">رقم بطاقة التعريف الوطنية</Label>
                <Input id="nationalId" value={formData.nationalId} onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })} required maxLength={18} disabled={!!editingFarmer} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmerCardNumber">رقم بطاقة الفلاح</Label>
                <Input id="farmerCardNumber" value={formData.farmerCardNumber} onChange={(e) => setFormData({ ...formData, farmerCardNumber: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
              </div>

              <Button type="submit" className="w-full bg-[var(--admin-green-trust)] rounded-xl py-6 mt-4">
                {editingFarmer ? "حفظ التغييرات" : "تسجيل في النظام"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-[var(--admin-gray-border)] shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl">
              <Users className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">الفلاحون النشطون</p>
              <h3 className="text-2xl font-bold text-slate-900">{farmers.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[var(--admin-gray-border)] shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">طلبات في انتظار المراجعة</p>
              <h3 className="text-2xl font-bold text-slate-900">{pendingFarmers.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl mb-6">
          <TabsTrigger value="active" className="rounded-lg px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            الفلاحون النشطون ({farmers.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative rounded-lg px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            الطلبات الجديدة ({pendingFarmers.length})
            {pendingFarmers.length > 0 && (
              <span className="absolute -top-1 -left-1 w-3 h-3 bg-rose-500 rounded-full animate-pulse border-2 border-white"></span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {farmers.length === 0 ? (
              <Card className="col-span-full border-dashed border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <UserX className="w-12 h-12 mb-4 opacity-20" />
                  <p>لا يوجد فلاحون نشطون حالياً</p>
                </CardContent>
              </Card>
            ) : (
              farmers.map((farmer) => (
                <FarmerCard
                  key={farmer.id}
                  farmer={farmer}
                  onEdit={() => handleEdit(farmer)}
                  onDelete={() => handleDelete(farmer.id)}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingFarmers.length === 0 ? (
              <Card className="col-span-full border-dashed border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <CheckCircle className="w-12 h-12 mb-4 opacity-20" />
                  <p>تم الانتهاء من مراجعة كل الطلبات</p>
                </CardContent>
              </Card>
            ) : (
              pendingFarmers.map((farmer) => (
                <PendingRequestCard
                  key={farmer.id}
                  farmer={farmer}
                  onApprove={() => handleStatusUpdate(farmer.id, "approved")}
                  onReject={() => handleStatusUpdate(farmer.id, "rejected")}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FarmerCard({ farmer, onEdit, onDelete }: any) {
  return (
    <Card className="border-[var(--admin-gray-border)] shadow-sm hover:shadow-md transition-all group overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
              {farmer.firstName[0]}
            </div>
            <div>
              <h4 className="font-bold text-slate-900">{farmer.firstName} {farmer.lastName}</h4>
              <p className="text-xs text-slate-400 mt-1">تاريخ التسجيل: {farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString('ar-DZ') : 'غير متوفر'}</p>
              <div className="flex gap-4 mt-2">
                <div className="text-[10px] bg-slate-50 border px-2 py-0.5 rounded text-slate-500 font-mono">ID: {farmer.nationalId}</div>
                {farmer.farmerCardNumber && (
                  <div className="text-[10px] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded text-blue-600 font-mono">FC: {farmer.farmerCardNumber}</div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 text-slate-400 hover:text-[var(--admin-green-trust)]">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-slate-400 hover:text-rose-500">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PendingRequestCard({ farmer, onApprove, onReject }: any) {
  return (
    <Card className="border-amber-200 bg-amber-50/30 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-amber-200 flex items-center justify-center text-amber-600 font-bold">
                {farmer.firstName[0]}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{farmer.firstName} {farmer.lastName}</h4>
                <p className="text-xs text-amber-600 font-medium">طلب تسجيل جديد</p>
                <div className="mt-2 text-xs text-slate-500">تاريخ الطلب: {new Date(farmer.createdAt).toLocaleString('ar-DZ')}</div>
              </div>
            </div>
            <div className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full uppercase tracking-tighter">قيد الانتظار</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs py-2">
            <div className="bg-white p-2 rounded-lg border border-amber-100">
              <span className="text-slate-400 block mb-1">رقم التعريف الوطني</span>
              <span className="font-mono font-bold text-slate-700">{farmer.nationalId}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-amber-100">
              <span className="text-slate-400 block mb-1">بطاقة الفلاح</span>
              <span className="font-mono font-bold text-slate-700">{farmer.farmerCardNumber || 'غير متوفر'}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={onApprove} className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl h-12 font-bold text-sm">
              <CheckCircle className="w-4 h-4 ml-2" />
              تأكيد الصلاحية
            </Button>
            <Button onClick={onReject} variant="outline" className="px-6 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl h-12">
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
