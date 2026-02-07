import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, Edit, Trash2, MapPin, Tractor, Users } from "lucide-react";
import { toast } from "sonner";

interface Land {
  id: string;
  name: string;
  area: number;
  location: string;
  soilType: string;
  status: string;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  purchaseDate: string;
  condition: string;
  maintenanceDate: string;
}

interface Worker {
  id: string;
  name: string;
  role: string;
  phone: string;
  salary: number;
  startDate: string;
}

interface ResourcesManagementProps {
  userId: string;
}

export default function ResourcesManagement({ userId }: ResourcesManagementProps) {
  const [lands, setLands] = useState<Land[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [activeTab, setActiveTab] = useState("lands");
  
  // Dialogs
  const [landDialogOpen, setLandDialogOpen] = useState(false);
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [workerDialogOpen, setWorkerDialogOpen] = useState(false);

  // Form states
  const [landForm, setLandForm] = useState({ name: "", area: "", location: "", soilType: "", status: "متاح" });
  const [equipmentForm, setEquipmentForm] = useState({ name: "", type: "", purchaseDate: "", condition: "جيد", maintenanceDate: "" });
  const [workerForm, setWorkerForm] = useState({ name: "", role: "", phone: "", salary: "", startDate: "" });

  const [editingLand, setEditingLand] = useState<Land | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const savedLands = localStorage.getItem(`lands_${userId}`);
    const savedEquipment = localStorage.getItem(`equipment_${userId}`);
    const savedWorkers = localStorage.getItem(`workers_${userId}`);
    
    if (savedLands) setLands(JSON.parse(savedLands));
    if (savedEquipment) setEquipment(JSON.parse(savedEquipment));
    if (savedWorkers) setWorkers(JSON.parse(savedWorkers));
  }, [userId]);

  // Land functions
  const handleLandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLand) {
      const updated = lands.map(l => l.id === editingLand.id ? { ...editingLand, ...landForm, area: Number(landForm.area) } : l);
      setLands(updated);
      localStorage.setItem(`lands_${userId}`, JSON.stringify(updated));
      toast.success("تم تحديث الأرض بنجاح");
    } else {
      const newLand: Land = { id: Date.now().toString(), ...landForm, area: Number(landForm.area) };
      const updated = [...lands, newLand];
      setLands(updated);
      localStorage.setItem(`lands_${userId}`, JSON.stringify(updated));
      toast.success("تم إضافة الأرض بنجاح");
    }
    setLandDialogOpen(false);
    setLandForm({ name: "", area: "", location: "", soilType: "", status: "متاح" });
    setEditingLand(null);
  };

  const handleDeleteLand = (id: string) => {
    const updated = lands.filter(l => l.id !== id);
    setLands(updated);
    localStorage.setItem(`lands_${userId}`, JSON.stringify(updated));
    toast.success("تم حذف الأرض بنجاح");
  };

  // Equipment functions
  const handleEquipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEquipment) {
      const updated = equipment.map(eq => eq.id === editingEquipment.id ? { ...editingEquipment, ...equipmentForm } : eq);
      setEquipment(updated);
      localStorage.setItem(`equipment_${userId}`, JSON.stringify(updated));
      toast.success("تم تحديث المعدة بنجاح");
    } else {
      const newEquipment: Equipment = { id: Date.now().toString(), ...equipmentForm };
      const updated = [...equipment, newEquipment];
      setEquipment(updated);
      localStorage.setItem(`equipment_${userId}`, JSON.stringify(updated));
      toast.success("تم إضافة المعدة بنجاح");
    }
    setEquipmentDialogOpen(false);
    setEquipmentForm({ name: "", type: "", purchaseDate: "", condition: "جيد", maintenanceDate: "" });
    setEditingEquipment(null);
  };

  const handleDeleteEquipment = (id: string) => {
    const updated = equipment.filter(eq => eq.id !== id);
    setEquipment(updated);
    localStorage.setItem(`equipment_${userId}`, JSON.stringify(updated));
    toast.success("تم حذف المعدة بنجاح");
  };

  // Worker functions
  const handleWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorker) {
      const updated = workers.map(w => w.id === editingWorker.id ? { ...editingWorker, ...workerForm, salary: Number(workerForm.salary) } : w);
      setWorkers(updated);
      localStorage.setItem(`workers_${userId}`, JSON.stringify(updated));
      toast.success("تم تحديث العامل بنجاح");
    } else {
      const newWorker: Worker = { id: Date.now().toString(), ...workerForm, salary: Number(workerForm.salary) };
      const updated = [...workers, newWorker];
      setWorkers(updated);
      localStorage.setItem(`workers_${userId}`, JSON.stringify(updated));
      toast.success("تم إضافة العامل بنجاح");
    }
    setWorkerDialogOpen(false);
    setWorkerForm({ name: "", role: "", phone: "", salary: "", startDate: "" });
    setEditingWorker(null);
  };

  const handleDeleteWorker = (id: string) => {
    const updated = workers.filter(w => w.id !== id);
    setWorkers(updated);
    localStorage.setItem(`workers_${userId}`, JSON.stringify(updated));
    toast.success("تم حذف العامل بنجاح");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2 text-green-800">إدارة الموارد</h2>
        <p className="text-gray-600">إدارة الأراضي والمعدات والعمال</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lands">
            <MapPin className="w-4 h-4 ml-2" />
            الأراضي
          </TabsTrigger>
          <TabsTrigger value="equipment">
            <Tractor className="w-4 h-4 ml-2" />
            المعدات
          </TabsTrigger>
          <TabsTrigger value="workers">
            <Users className="w-4 h-4 ml-2" />
            العمال
          </TabsTrigger>
        </TabsList>

        {/* Lands Tab */}
        <TabsContent value="lands" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={landDialogOpen} onOpenChange={setLandDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingLand(null); setLandForm({ name: "", area: "", location: "", soilType: "", status: "متاح" }); }} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة أرض
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>{editingLand ? "تعديل الأرض" : "إضافة أرض جديدة"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleLandSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="landName">اسم الأرض</Label>
                    <Input id="landName" value={landForm.name} onChange={(e) => setLandForm({ ...landForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="landArea">المساحة (هكتار)</Label>
                    <Input id="landArea" type="number" step="0.1" value={landForm.area} onChange={(e) => setLandForm({ ...landForm, area: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="location">الموقع</Label>
                    <Input id="location" value={landForm.location} onChange={(e) => setLandForm({ ...landForm, location: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="soilType">نوع التربة</Label>
                    <Select value={landForm.soilType} onValueChange={(value) => setLandForm({ ...landForm, soilType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع التربة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="طينية">طينية</SelectItem>
                        <SelectItem value="رملية">رملية</SelectItem>
                        <SelectItem value="طينية رملية">طينية رملية</SelectItem>
                        <SelectItem value="جيرية">جيرية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="landStatus">الحالة</Label>
                    <Select value={landForm.status} onValueChange={(value) => setLandForm({ ...landForm, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="متاح">متاح</SelectItem>
                        <SelectItem value="مزروع">مزروع</SelectItem>
                        <SelectItem value="تحت الصيانة">تحت الصيانة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    {editingLand ? "تحديث" : "إضافة"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lands.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">لا توجد أراضي مسجلة</p>
                </CardContent>
              </Card>
            ) : (
              lands.map((land) => (
                <Card key={land.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{land.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-500">المساحة:</span> {land.area} هكتار</p>
                      <p><span className="text-gray-500">الموقع:</span> {land.location}</p>
                      <p><span className="text-gray-500">نوع التربة:</span> {land.soilType}</p>
                      <p><span className="text-gray-500">الحالة:</span> <span className={land.status === "متاح" ? "text-green-600" : "text-blue-600"}>{land.status}</span></p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={() => { setEditingLand(land); setLandForm({ name: land.name, area: land.area.toString(), location: land.location, soilType: land.soilType, status: land.status }); setLandDialogOpen(true); }} variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 ml-2" />تعديل
                      </Button>
                      <Button onClick={() => handleDeleteLand(land.id)} variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={equipmentDialogOpen} onOpenChange={setEquipmentDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingEquipment(null); setEquipmentForm({ name: "", type: "", purchaseDate: "", condition: "جيد", maintenanceDate: "" }); }} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة معدة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>{editingEquipment ? "تعديل المعدة" : "إضافة معدة جديدة"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEquipmentSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="equipmentName">اسم المعدة</Label>
                    <Input id="equipmentName" value={equipmentForm.name} onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="equipmentType">النوع</Label>
                    <Select value={equipmentForm.type} onValueChange={(value) => setEquipmentForm({ ...equipmentForm, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع المعدة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="جرار">جرار</SelectItem>
                        <SelectItem value="محراث">محراث</SelectItem>
                        <SelectItem value="حصادة">حصادة</SelectItem>
                        <SelectItem value="مضخة">مضخة</SelectItem>
                        <SelectItem value="أخرى">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="purchaseDate">تاريخ الشراء</Label>
                    <Input id="purchaseDate" type="date" value={equipmentForm.purchaseDate} onChange={(e) => setEquipmentForm({ ...equipmentForm, purchaseDate: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="condition">الحالة</Label>
                    <Select value={equipmentForm.condition} onValueChange={(value) => setEquipmentForm({ ...equipmentForm, condition: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ممتاز">ممتاز</SelectItem>
                        <SelectItem value="جيد">جيد</SelectItem>
                        <SelectItem value="متوسط">متوسط</SelectItem>
                        <SelectItem value="يحتاج صيانة">يحتاج صيانة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maintenanceDate">آخر صيانة</Label>
                    <Input id="maintenanceDate" type="date" value={equipmentForm.maintenanceDate} onChange={(e) => setEquipmentForm({ ...equipmentForm, maintenanceDate: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    {editingEquipment ? "تحديث" : "إضافة"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Tractor className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">لا توجد معدات مسجلة</p>
                </CardContent>
              </Card>
            ) : (
              equipment.map((eq) => (
                <Card key={eq.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{eq.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-500">النوع:</span> {eq.type}</p>
                      <p><span className="text-gray-500">تاريخ الشراء:</span> {new Date(eq.purchaseDate).toLocaleDateString("ar-DZ")}</p>
                      <p><span className="text-gray-500">الحالة:</span> <span className={eq.condition === "ممتاز" || eq.condition === "جيد" ? "text-green-600" : "text-yellow-600"}>{eq.condition}</span></p>
                      {eq.maintenanceDate && <p><span className="text-gray-500">آخر صيانة:</span> {new Date(eq.maintenanceDate).toLocaleDateString("ar-DZ")}</p>}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={() => { setEditingEquipment(eq); setEquipmentForm({ name: eq.name, type: eq.type, purchaseDate: eq.purchaseDate, condition: eq.condition, maintenanceDate: eq.maintenanceDate }); setEquipmentDialogOpen(true); }} variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 ml-2" />تعديل
                      </Button>
                      <Button onClick={() => handleDeleteEquipment(eq.id)} variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Workers Tab */}
        <TabsContent value="workers" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={workerDialogOpen} onOpenChange={setWorkerDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingWorker(null); setWorkerForm({ name: "", role: "", phone: "", salary: "", startDate: "" }); }} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة عامل
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>{editingWorker ? "تعديل العامل" : "إضافة عامل جديد"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleWorkerSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="workerName">الاسم الكامل</Label>
                    <Input id="workerName" value={workerForm.name} onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="role">الوظيفة</Label>
                    <Input id="role" value={workerForm.role} onChange={(e) => setWorkerForm({ ...workerForm, role: e.target.value })} required placeholder="مثال: عامل زراعي" />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input id="phone" value={workerForm.phone} onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })} required placeholder="0555123456" />
                  </div>
                  <div>
                    <Label htmlFor="salary">الراتب (دج)</Label>
                    <Input id="salary" type="number" value={workerForm.salary} onChange={(e) => setWorkerForm({ ...workerForm, salary: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="startDate">تاريخ التوظيف</Label>
                    <Input id="startDate" type="date" value={workerForm.startDate} onChange={(e) => setWorkerForm({ ...workerForm, startDate: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    {editingWorker ? "تحديث" : "إضافة"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">لا يوجد عمال مسجلون</p>
                </CardContent>
              </Card>
            ) : (
              workers.map((worker) => (
                <Card key={worker.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{worker.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-500">الوظيفة:</span> {worker.role}</p>
                      <p><span className="text-gray-500">الهاتف:</span> {worker.phone}</p>
                      <p><span className="text-gray-500">الراتب:</span> {worker.salary.toLocaleString()} دج</p>
                      <p><span className="text-gray-500">تاريخ التوظيف:</span> {new Date(worker.startDate).toLocaleDateString("ar-DZ")}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={() => { setEditingWorker(worker); setWorkerForm({ name: worker.name, role: worker.role, phone: worker.phone, salary: worker.salary.toString(), startDate: worker.startDate }); setWorkerDialogOpen(true); }} variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 ml-2" />تعديل
                      </Button>
                      <Button onClick={() => handleDeleteWorker(worker.id)} variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}