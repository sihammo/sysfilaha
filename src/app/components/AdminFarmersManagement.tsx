import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Plus, Edit, Trash2, UserCheck, Users, Check, X } from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";

interface Farmer {
  _id: string; // MongoDB ID
  id: string; // Compatibility
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
      const approved = data.filter((f: Farmer) => f.status === "approved");
      const pending = data.filter((f: Farmer) => f.status === "pending");
      setFarmers(approved);
      setPendingRequests(pending);
    } catch (error: any) {
      toast.error(error.message || "Failed to load farmers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingFarmer) {
        await api.admin.updateFarmer(editingFarmer._id, formData);
        toast.success("تم تحديث بيانات الفلاح بنجاح");
      } else {
        // Add new farmer via register (and then we approve them automically or just let them register)
        await api.auth.register({
          ...formData,
          status: 'approved',
          approved: true
        });
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
      toast.success("تم الموافقة على طلب التسجيل");
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
      password: "", // Don't show password
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الفلاح وجميع بياناته؟ لا يمكن التراجع عن هذه العملية.")) {
      try {
        await api.admin.deleteFarmer(id);
        toast.success("تم حذف الفلاح وجميع بياناته بنجاح");
        loadFarmers();
      } catch (error: any) {
        toast.error(error.message || "فشل حذف الفلاح");
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-2 text-green-800">إدارة الفلاحين</h2>
          <p className="text-gray-600">تسجيل وإدارة وموافقة على حسابات الفلاحين</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
              <Plus className="w-4 h-4 ml-2" />
              تسجيل فلاح جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingFarmer ? "تعديل بيانات الفلاح" : "تسجيل فلاح جديد"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="firstName">الاسم</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  placeholder="مثال: أحمد"
                />
              </div>

              <div>
                <Label htmlFor="lastName">اللقب</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  placeholder="مثال: بن علي"
                />
              </div>

              <div>
                <Label htmlFor="nationalId">رقم بطاقة التعريف الوطنية</Label>
                <Input
                  id="nationalId"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  required
                  maxLength={18}
                  placeholder="13 رقم"
                  disabled={!!editingFarmer}
                />
              </div>

              <div>
                <Label htmlFor="farmerCardNumber">رقم بطاقة الفلاح</Label>
                <Input
                  id="farmerCardNumber"
                  value={formData.farmerCardNumber}
                  onChange={(e) => setFormData({ ...formData, farmerCardNumber: e.target.value })}
                  placeholder="مثال: FC123456 (اختياري)"
                  disabled={!!editingFarmer}
                />
              </div>

              {!editingFarmer && (
                <div>
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="أدخل كلمة المرور"
                  />
                </div>
              )}

              <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                {editingFarmer ? "تحديث البيانات" : "تسجيل الفلاح"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {pendingRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <h3 className="text-2xl font-semibold text-orange-700">طلبات التسجيل قيد الانتظار ({pendingRequests.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((request) => (
              <Card key={request._id} className="border-l-4 border-l-orange-500 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-900">
                    {request.firstName} {request.lastName}
                  </CardTitle>
                  <p className="text-sm text-orange-700">طلب تسجيل قيد المراجعة</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p className="text-gray-600">
                      <span className="font-semibold">البطاقة:</span> {request.nationalId}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">الولاية:</span> {request.region}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">الهاتف:</span> {request.phone}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleApprove(request._id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 gap-1"
                    >
                      <Check className="w-4 h-4" />
                      الموافقة
                    </Button>
                    <Button
                      onClick={() => handleReject(request._id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="w-4 h-4" />
                      رفض
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg text-green-800">إجمالي الفلاحين المسجلين</CardTitle>
          <Users className="w-6 h-6 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl text-green-700 font-bold">{farmers.length}</div>
          <p className="text-sm text-gray-600 mt-1">فلاح نشط في النظام</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {farmers.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserCheck className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">لا يوجد فلاحين مسجلين</p>
            </CardContent>
          </Card>
        ) : (
          farmers.map((farmer) => (
            <Card key={farmer._id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-600">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-800">
                      {farmer.firstName} {farmer.lastName}
                    </CardTitle>
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <UserCheck className="w-4 h-4" />
                      فلاح موافق عليه
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <p className="text-gray-700">
                    <span className="text-gray-500 font-semibold">رقم التعريف:</span>
                    <br />
                    <span className="font-mono text-xs">{farmer.nationalId}</span>
                  </p>
                  {farmer.region && (
                    <p className="text-gray-700">
                      <span className="text-gray-500 font-semibold">الولاية:</span> {farmer.region}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleEdit(farmer)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => handleDelete(farmer._id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
