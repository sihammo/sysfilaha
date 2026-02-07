import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Plus, Edit, Trash2, Calendar, Sprout } from "lucide-react";
import { toast } from "sonner";

interface Crop {
  id: string;
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
    const savedCrops = localStorage.getItem(`crops_${userId}`);
    if (savedCrops) {
      setCrops(JSON.parse(savedCrops));
    }
  }, [userId]);

  const saveCrops = (newCrops: Crop[]) => {
    setCrops(newCrops);
    localStorage.setItem(`crops_${userId}`, JSON.stringify(newCrops));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCrop) {
      const updatedCrops = crops.map((crop) =>
        crop.id === editingCrop.id
          ? { ...editingCrop, ...formData, area: Number(formData.area), expectedYield: Number(formData.expectedYield) }
          : crop
      );
      saveCrops(updatedCrops);
      toast.success("تم تحديث المحصول بنجاح");
    } else {
      const newCrop: Crop = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        area: Number(formData.area),
        plantingDate: formData.plantingDate,
        harvestDate: formData.harvestDate,
        status: formData.status,
        expectedYield: Number(formData.expectedYield),
      };
      saveCrops([...crops, newCrop]);
      toast.success("تم إضافة المحصول بنجاح");
    }

    setIsDialogOpen(false);
    resetForm();
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
      plantingDate: crop.plantingDate,
      harvestDate: crop.harvestDate,
      status: crop.status,
      expectedYield: crop.expectedYield.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    saveCrops(crops.filter((crop) => crop.id !== id));
    toast.success("تم حذف المحصول بنجاح");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مزروع":
        return "bg-green-100 text-green-800";
      case "جاهز للحصاد":
        return "bg-yellow-100 text-yellow-800";
      case "تم الحصاد":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
            <DialogHeader>
              <DialogTitle>{editingCrop ? "تعديل المحصول" : "إضافة محصول جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">اسم المحصول</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="مثال: قمح"
                />
              </div>

              <div>
                <Label htmlFor="type">نوع المحصول</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع المحصول" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="حبوب">حبوب</SelectItem>
                    <SelectItem value="خضروات">خضروات</SelectItem>
                    <SelectItem value="فواكه">فواكه</SelectItem>
                    <SelectItem value="بقوليات">بقوليات</SelectItem>
                    <SelectItem value="أعلاف">أعلاف</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="area">المساحة (هكتار)</Label>
                <Input
                  id="area"
                  type="number"
                  step="0.1"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  required
                  placeholder="مثال: 5"
                />
              </div>

              <div>
                <Label htmlFor="plantingDate">تاريخ الزراعة</Label>
                <Input
                  id="plantingDate"
                  type="date"
                  value={formData.plantingDate}
                  onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="harvestDate">تاريخ الحصاد المتوقع</Label>
                <Input
                  id="harvestDate"
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="expectedYield">الإنتاج المتوقع (قنطار)</Label>
                <Input
                  id="expectedYield"
                  type="number"
                  step="0.1"
                  value={formData.expectedYield}
                  onChange={(e) => setFormData({ ...formData, expectedYield: e.target.value })}
                  required
                  placeholder="مثال: 100"
                />
              </div>

              <div>
                <Label htmlFor="status">الحالة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مزروع">مزروع</SelectItem>
                    <SelectItem value="جاهز للحصاد">جاهز للحصاد</SelectItem>
                    <SelectItem value="تم الحصاد">تم الحصاد</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                {editingCrop ? "تحديث" : "إضافة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crops.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sprout className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">لا توجد محاصيل مسجلة</p>
              <p className="text-sm text-gray-400">ابدأ بإضافة محصولك الأول</p>
            </CardContent>
          </Card>
        ) : (
          crops.map((crop) => (
            <Card key={crop.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{crop.name}</CardTitle>
                    <p className="text-sm text-gray-500">{crop.type}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(crop.status)}`}>
                    {crop.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">المساحة</p>
                    <p>{crop.area} هكتار</p>
                  </div>
                  <div>
                    <p className="text-gray-500">الإنتاج المتوقع</p>
                    <p>{crop.expectedYield} قنطار</p>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>الزراعة: {new Date(crop.plantingDate).toLocaleDateString("ar-DZ")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>الحصاد: {new Date(crop.harvestDate).toLocaleDateString("ar-DZ")}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleEdit(crop)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => handleDelete(crop.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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