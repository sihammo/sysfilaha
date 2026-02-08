import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, Edit, Trash2, MapPin, Tractor, Users, Map as MapIcon } from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";
import LeafletLandDrawing from "./LeafletLandDrawing";

interface Land {
  _id: string;
  name: string;
  area: number;
  location: string;
  soilType: string;
  status: string;
  coordinates?: { lat: number, lng: number }[];
}

interface Equipment {
  _id: string;
  name: string;
  type: string;
  purchaseDate: string;
  condition: string;
  maintenanceDate: string;
}

interface Worker {
  _id: string;
  name: string;
  role: string;
  phone: string;
  salary: number;
  startDate: string;
}

export default function ResourcesManagement({ userId }: { userId: string }) {
  const [lands, setLands] = useState<Land[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [activeTab, setActiveTab] = useState("lands");
  const [isLoading, setIsLoading] = useState(true);

  const [landDialogOpen, setLandDialogOpen] = useState(false);
  const [eqDialogOpen, setEqDialogOpen] = useState(false);
  const [workerDialogOpen, setWorkerDialogOpen] = useState(false);

  const [landForm, setLandForm] = useState({ name: "", area: "", location: "", soilType: "طينية", status: "متاح", coordinates: [] as { lat: number, lng: number }[] });
  const [eqForm, setEqForm] = useState({ name: "", type: "جرار", purchaseDate: "", condition: "جيد" });
  const [workerForm, setWorkerForm] = useState({ name: "", role: "", phone: "", salary: "", startDate: "" });

  const [editingLand, setEditingLand] = useState<Land | null>(null);
  const [editingEq, setEditingEq] = useState<Equipment | null>(null);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [isDrawingMap, setIsDrawingMap] = useState(false);

  useEffect(() => { loadAll(); }, [userId]);

  const loadAll = async () => {
    try {
      setIsLoading(true);
      const [l, e, w] = await Promise.all([api.farmer.getLands(), api.farmer.getEquipment(), api.farmer.getWorkers()]);
      setLands(l); setEquipment(e); setWorkers(w);
    } catch (err) { toast.error("فشل التحميل"); }
    finally { setIsLoading(false); }
  };

  const onLandSubmit = async (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const payload = { ...landForm, area: Number(landForm.area) };
      if (editingLand) await api.farmer.updateLand(editingLand._id, payload);
      else await api.farmer.addLand(payload);
      toast.success("تم الحفظ");
      loadAll();
      setLandDialogOpen(false);
      setIsDrawingMap(false);
    } catch (err) { toast.error("فشل الحفظ"); }
  };

  const onMapSave = (coordinates: { lat: number, lng: number }[], areaHectares: number) => {
    setLandForm({ ...landForm, area: areaHectares.toString(), coordinates });
    // We don't submit yet, just update the form and close map view
    setIsDrawingMap(false);
    toast.info(`تم تحديد المساحة: ${areaHectares} هكتار`);
  };

  const onEqSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingEq) await api.farmer.updateEquipment(editingEq._id, eqForm);
      else await api.farmer.addEquipment(eqForm);
      toast.success("تم الحفظ"); loadAll(); setEqDialogOpen(false);
    } catch (err) { toast.error("فشل الحفظ"); }
  };

  const onWorkerSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingWorker) await api.farmer.updateWorker(editingWorker._id, { ...workerForm, salary: Number(workerForm.salary) });
      else await api.farmer.addWorker({ ...workerForm, salary: Number(workerForm.salary) });
      toast.success("تم الحفظ"); loadAll(); setWorkerDialogOpen(false);
    } catch (err) { toast.error("فشل الحفظ"); }
  };

  const deleteResource = async (type: string, id: string) => {
    if (!confirm("تأكيد الحذف؟")) return;
    try {
      if (type === "land") await api.farmer.deleteLand(id);
      if (type === "eq") await api.farmer.deleteEquipment(id);
      if (type === "worker") await api.farmer.deleteWorker(id);
      toast.success("تم الحذف"); loadAll();
    } catch (err) { toast.error("فشل الحذف"); }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl text-green-800">إدارة الموارد</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lands">الأراضي ({lands.length})</TabsTrigger>
          <TabsTrigger value="equipment">المعدات ({equipment.length})</TabsTrigger>
          <TabsTrigger value="workers">العمال ({workers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="lands" className="space-y-4">
          <Button onClick={() => { setEditingLand(null); setLandForm({ name: "", area: "", location: "", soilType: "طينية", status: "متاح", coordinates: [] }); setLandDialogOpen(true); }}>إضافة أرض</Button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lands.map(l => (
              <Card key={l._id}>
                <CardHeader className="pb-2 flex flex-row justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CardTitle>{l.name}</CardTitle>
                    {l.coordinates && l.coordinates.length > 0 && <MapIcon className="w-4 h-4 text-green-500" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{l.area} هكتار - {l.location}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => {
                      setEditingLand(l);
                      setLandForm({
                        name: l.name,
                        area: l.area.toString(),
                        location: l.location,
                        soilType: l.soilType,
                        status: l.status,
                        coordinates: l.coordinates || []
                      });
                      setLandDialogOpen(true);
                    }}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteResource("land", l._id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Similar contents for equipment and workers (truncated for brevity but logic is clear) */}
        {/* For the sake of completing the task, I will include the rest of the implementation */}
        <TabsContent value="equipment" className="space-y-4">
          <Button onClick={() => { setEditingEq(null); setEqForm({ name: "", type: "جرار", purchaseDate: "", condition: "جيد" }); setEqDialogOpen(true); }}>إضافة معدة</Button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {equipment.map(e => (
              <Card key={e._id}>
                <CardHeader className="pb-2 flex flex-row justify-between items-start"><CardTitle>{e.name}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{e.type} - {e.condition}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => { setEditingEq(e); setEqForm({ name: e.name, type: e.type, purchaseDate: e.purchaseDate ? e.purchaseDate.split('T')[0] : "", condition: e.condition }); setEqDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteResource("eq", e._id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workers" className="space-y-4">
          <Button onClick={() => { setEditingWorker(null); setWorkerForm({ name: "", role: "", phone: "", salary: "", startDate: "" }); setWorkerDialogOpen(true); }}>إضافة عامل</Button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workers.map(w => (
              <Card key={w._id}>
                <CardHeader className="pb-2 flex flex-row justify-between items-start"><CardTitle>{w.name}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{w.role} - {w.phone}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => { setEditingWorker(w); setWorkerForm({ name: w.name, role: w.role, phone: w.phone, salary: w.salary.toString(), startDate: w.startDate ? w.startDate.split('T')[0] : "" }); setWorkerDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteResource("worker", w._id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs for Land, Eq, Worker */}
      <Dialog open={landDialogOpen} onOpenChange={(open) => { setLandDialogOpen(open); if (!open) setIsDrawingMap(false); }}>
        <DialogContent dir="rtl" className={isDrawingMap ? "max-w-5xl" : "max-w-md"}>
          <DialogHeader>
            <DialogTitle>{editingLand ? "تعديل معلومات الأرض" : "إضافة أرض زراعية جديدة"}</DialogTitle>
          </DialogHeader>

          {isDrawingMap ? (
            <div className="mt-4">
              <LeafletLandDrawing
                initialCoordinates={landForm.coordinates}
                onSave={onMapSave}
                onCancel={() => setIsDrawingMap(false)}
              />
            </div>
          ) : (
            <form onSubmit={onLandSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label>اسم القطعة الأرضية</Label>
                <Input placeholder="مثال: قطعتي الشمالية" value={landForm.name} onChange={e => setLandForm({ ...landForm, name: e.target.value })} required />
              </div>

              <div className="grid gap-2">
                <Label>تحديد الحدود المساحية</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex gap-2 border-green-500 text-green-700"
                  onClick={() => setIsDrawingMap(true)}
                >
                  <MapPin className="w-4 h-4" />
                  {landForm.coordinates.length > 0 ? "تعديل الرسم على الخريطة" : "رسم حدود الأرض على الخريطة"}
                </Button>
                {landForm.coordinates.length > 0 && (
                  <p className="text-xs text-green-600">✓ تم رسم الحدود وتحديد المساحة أوتوماتيكياً</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>المساحة (هكتار)</Label>
                <Input placeholder="المساحة" type="number" step="0.01" value={landForm.area} onChange={e => setLandForm({ ...landForm, area: e.target.value })} required />
              </div>

              <div className="grid gap-2">
                <Label>الموقع (البلدية/الولاية)</Label>
                <Input placeholder="الموقع" value={landForm.location} onChange={e => setLandForm({ ...landForm, location: e.target.value })} required />
              </div>

              <div className="grid gap-2">
                <Label>نوع التربة</Label>
                <Select value={landForm.soilType} onValueChange={v => setLandForm({ ...landForm, soilType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="طينية">طينية</SelectItem>
                    <SelectItem value="رملية">رملية</SelectItem>
                    <SelectItem value="غرينية">غرينية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">حفظ كافة البيانات</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={eqDialogOpen} onOpenChange={setEqDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>{editingEq ? "تعديل المعدة" : "إضافة معدة"}</DialogTitle></DialogHeader>
          <form onSubmit={onEqSubmit} className="space-y-4">
            <Input placeholder="اسم المعدة" value={eqForm.name} onChange={e => setEqForm({ ...eqForm, name: e.target.value })} required />
            <Input placeholder="تاريخ الشراء" type="date" value={eqForm.purchaseDate} onChange={e => setEqForm({ ...eqForm, purchaseDate: e.target.value })} required />
            <Button type="submit" className="w-full bg-green-600">حفظ</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={workerDialogOpen} onOpenChange={setWorkerDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>{editingWorker ? "تعديل العامل" : "إضافة عامل"}</DialogTitle></DialogHeader>
          <form onSubmit={onWorkerSubmit} className="space-y-4">
            <Input placeholder="الاسم" value={workerForm.name} onChange={e => setWorkerForm({ ...workerForm, name: e.target.value })} required />
            <Input placeholder="رقم الهاتف" value={workerForm.phone} onChange={e => setWorkerForm({ ...workerForm, phone: e.target.value })} required />
            <Input placeholder="الراتب" type="number" value={workerForm.salary} onChange={e => setWorkerForm({ ...workerForm, salary: e.target.value })} required />
            <Button type="submit" className="w-full bg-green-600">حفظ</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}