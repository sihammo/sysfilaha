import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Plus, Edit, Trash2, Calendar, Sprout } from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";

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
        toast.success("تم تحديث المحصول بنجاح");
      } else {
        await api.farmer.addCrop(payload);
        toast.success("تم إضافة المحصول بنجاح");
      }
      loadCrops();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "فشل العملية");
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
    if (confirm("هل أنت متأكد من حذف هذا المحصول؟")) {
      try {
        await api.farmer.deleteCrop(id);
        toast.success("تم حذف المحصول بنجاح");
        loadCrops();
      } catch (error: any) {
        toast.error(error.message || "فشل حذف المحصول");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مزروع": return "bg-green-100 text-green-800";
      case "جاهز للحصاد": return "bg-yellow-100 text-yellow-800";
      case "تم الحصاد": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-2 text-green-800">إدارة المحاصيل</h2>
          <p className="text-gray-600">تتبع وإدارة جميع محاصيلك</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة محصول جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader><DialogTitle>{editingCrop ? "تعديل المحصول" : "إضافة محصول جديد"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label htmlFor="name">اسم المحصول</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div>
                <Label htmlFor="type">نوع المحصول</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="حبوب">حبوب</SelectItem>
                    <SelectItem value="خضرووات">خضروات</SelectItem>
                    <SelectItem value="فواكه">فواكه</SelectItem>
                    <SelectItem value="بقوليات">بقوليات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label htmlFor="area">المساحة</Label><Input id="area" type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} required /></div>
                <div><Label htmlFor="expectedYield">الإنتاج المتوقع</Label><Input id="expectedYield" type="number" value={formData.expectedYield} onChange={(e) => setFormData({ ...formData, expectedYield: e.target.value })} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label htmlFor="plantingDate">تاريخ الزراعة</Label><Input id="plantingDate" type="date" value={formData.plantingDate} onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })} required /></div>
                <div><Label htmlFor="harvestDate">تاريخ الحصاد</Label><Input id="harvestDate" type="date" value={formData.harvestDate} onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })} required /></div>
              </div>
              <Button type="submit" className="w-full bg-green-600">{editingCrop ? "تحديث" : "إضافة"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crops.map((crop) => (
          <Card key={crop._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div><CardTitle className="text-xl">{crop.name}</CardTitle><p className="text-sm text-gray-500">{crop.type}</p></div>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(crop.status)}`}>{crop.status}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span>{crop.area} هكتار</span><span>{crop.expectedYield} قنطار</span></div>
              <div className="flex gap-2">
                <Button onClick={() => handleEdit(crop)} variant="outline" size="sm" className="flex-1"><Edit className="w-4 h-4 ml-1" /> تعديل</Button>
                <Button onClick={() => handleDelete(crop._id)} variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}