import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Tractor,
  Users,
  Map as MapIcon,
  Search,
  Wrench,
  Navigation,
  Phone,
  DollarSign,
  Calendar as CalendarIcon,
  ChevronLeft,
  Settings2,
  HardHat
} from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";
import LeafletLandDrawing from "./LeafletLandDrawing";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../utils/cn";

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
  const [searchQuery, setSearchQuery] = useState("");

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
      toast.success("تم حفظ معلومات الأرض");
      loadAll(); setLandDialogOpen(false); setIsDrawingMap(false);
    } catch (err) { toast.error("فشل الحفظ"); }
  };

  const onEqSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingEq) await api.farmer.updateEquipment(editingEq._id, eqForm);
      else await api.farmer.addEquipment(eqForm);
      toast.success("تم تحديث المعدات"); loadAll(); setEqDialogOpen(false);
    } catch (err) { toast.error("فشل الحفظ"); }
  };

  const onWorkerSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingWorker) await api.farmer.updateWorker(editingWorker._id, { ...workerForm, salary: Number(workerForm.salary) });
      else await api.farmer.addWorker({ ...workerForm, salary: Number(workerForm.salary) });
      toast.success("تم حفظ بيانات العامل"); loadAll(); setWorkerDialogOpen(false);
    } catch (err) { toast.error("فشل الحفظ"); }
  };

  const deleteResource = async (type: string, id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      if (type === "land") await api.farmer.deleteLand(id);
      if (type === "eq") await api.farmer.deleteEquipment(id);
      if (type === "worker") await api.farmer.deleteWorker(id);
      toast.success("تم الحذف بنجاح"); loadAll();
    } catch (err) { toast.error("فشل حذف المورد"); }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-10 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in-fade" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">إدارة الموارد</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">الأراضي، العتاد، والقوة البشرية للمستثمرة.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl" className="w-full">
        <TabsList className="grid grid-cols-3 h-16 bg-white border border-slate-100 p-2 rounded-2xl shadow-sm mb-8">
          <TabsTrigger value="lands" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-lg transition-all flex gap-2">
            <MapIcon className="w-5 h-5" /> الأراضي ({lands.length})
          </TabsTrigger>
          <TabsTrigger value="equipment" className="rounded-xl data-[state=active]:bg-orange-600 data-[state=active]:text-white font-bold text-lg transition-all flex gap-2">
            <Tractor className="w-5 h-5" /> العتاد ({equipment.length})
          </TabsTrigger>
          <TabsTrigger value="workers" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold text-lg transition-all flex gap-2">
            <Users className="w-5 h-5" /> العمال ({workers.length})
          </TabsTrigger>
        </TabsList>

        {/* Lands Tab */}
        <TabsContent value="lands" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 max-w-sm relative group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary" />
              <input
                placeholder="ابحث عن قطعة أرض..."
                className="w-full pr-12 pl-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold"
              />
            </div>
            <Button onClick={() => { setEditingLand(null); setLandForm({ name: "", area: "", location: "", soilType: "طينية", status: "متاح", coordinates: [] }); setLandDialogOpen(true); }} className="h-14 bg-primary text-white rounded-2xl px-6 flex gap-2 font-black shadow-lg shadow-primary/20">
              <Plus className="w-6 h-6" /> إضافة قطعة أرضية
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {lands.map(l => (
                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={l._id}>
                  <Card className="border-none bg-white rounded-[2.5rem] shadow-sm hover:shadow-md transition-all overflow-hidden border border-slate-50 group">
                    <div className="h-40 bg-slate-100 relative grayscale group-hover:grayscale-0 transition-all duration-700">
                      <img src={`https://images.unsplash.com/photo-1500382017468-9049fee74162?auto=format&fit=crop&q=80&w=800`} alt="land" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                      <div className="absolute bottom-4 right-4 text-white">
                        <h4 className="text-xl font-black">{l.name}</h4>
                        <p className="text-xs font-medium opacity-80">{l.location}</p>
                      </div>
                    </div>
                    <CardContent className="p-8 space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100">
                          <Navigation className="w-4 h-4" />
                          <span className="text-xs font-black">{l.area} HECTARE</span>
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-400">نوع التربة: <span className="text-slate-900">{l.soilType}</span></span>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-100 hover:border-primary hover:bg-primary/5 font-bold" onClick={() => {
                          setEditingLand(l);
                          setLandForm({ name: l.name, area: l.area.toString(), location: l.location, soilType: l.soilType, status: l.status, coordinates: l.coordinates || [] });
                          setLandDialogOpen(true);
                        }}>تعديل</Button>
                        <Button variant="ghost" className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white" onClick={() => deleteResource("land", l._id)}><Trash2 className="w-5 h-5" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 max-w-sm relative group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-600" />
              <input placeholder="ابحث عن آلة..." className="w-full pr-12 pl-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-orange-600/10 font-bold" />
            </div>
            <Button onClick={() => { setEditingEq(null); setEqForm({ name: "", type: "جرار", purchaseDate: "", condition: "جيد" }); setEqDialogOpen(true); }} className="h-14 bg-orange-600 text-white rounded-2xl px-6 flex gap-2 font-black shadow-lg shadow-orange-600/20">
              <Plus className="w-6 h-6" /> إضافة عتاد جديد
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {equipment.map(e => (
                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={e._id}>
                  <Card className="border-none bg-white rounded-[2.5rem] shadow-sm hover:shadow-md transition-all overflow-hidden border border-slate-50 group">
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between mb-8">
                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Tractor className="w-8 h-8 text-orange-600" />
                        </div>
                        <Badge variant="outline" className={cn(
                          "rounded-full px-4 py-1.5 text-[10px] font-black uppercase",
                          e.condition === "جيد" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                        )}>{e.condition}</Badge>
                      </div>

                      <h4 className="text-2xl font-black text-slate-900 mb-2">{e.name}</h4>
                      <p className="text-sm font-bold text-slate-400 mb-8">{e.type}</p>

                      <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mb-8">
                        <Wrench className="w-4 h-4" />
                        <span>آخر صيانة: {e.maintenanceDate || "غير مسجلة"}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-100 hover:border-orange-600 hover:bg-orange-600/5 font-bold" onClick={() => { setEditingEq(e); setEqForm({ name: e.name, type: e.type, purchaseDate: e.purchaseDate ? e.purchaseDate.split('T')[0] : "", condition: e.condition }); setEqDialogOpen(true); }}>تعديل</Button>
                        <Button variant="ghost" className="w-12 h-12 bg-slate-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white" onClick={() => deleteResource("eq", e._id)}><Trash2 className="w-5 h-5" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Workers Tab */}
        <TabsContent value="workers" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 max-w-sm relative group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600" />
              <input placeholder="ابحث عن عامل..." className="w-full pr-12 pl-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 font-bold" />
            </div>
            <Button onClick={() => { setEditingWorker(null); setWorkerForm({ name: "", role: "", phone: "", salary: "", startDate: "" }); setWorkerDialogOpen(true); }} className="h-14 bg-blue-600 text-white rounded-2xl px-6 flex gap-2 font-black shadow-lg shadow-blue-600/20">
              <Plus className="w-6 h-6" /> تسجيل عامل
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {workers.map(w => (
                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={w._id}>
                  <Card className="border-none bg-white rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group overflow-hidden border border-slate-50">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-6 mb-8">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                          <HardHat className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-black text-slate-900 leading-none">{w.name}</h4>
                          <p className="text-sm font-bold text-blue-500 mt-2 uppercase tracking-widest italic">{w.role}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl space-y-3 mb-8">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold">رقم الهاتف</span>
                          <span className="text-slate-900 font-mono font-bold flex items-center gap-1"><Phone className="w-3 h-3" /> {w.phone}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold">الراتب المتفق</span>
                          <span className="text-emerald-600 font-black flex items-center gap-1"><DollarSign className="w-3 h-3" /> {w.salary.toLocaleString()} دج</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-100 hover:border-blue-600 hover:bg-blue-600/5 font-bold" onClick={() => { setEditingWorker(w); setWorkerForm({ name: w.name, role: w.role, phone: w.phone, salary: w.salary.toString(), startDate: w.startDate ? w.startDate.split('T')[0] : "" }); setWorkerDialogOpen(true); }}>تعديل</Button>
                        <Button variant="ghost" className="w-12 h-12 bg-slate-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white" onClick={() => deleteResource("worker", w._id)}><Trash2 className="w-5 h-5" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modern Dialogs */}
      <Dialog open={landDialogOpen} onOpenChange={(open) => { setLandDialogOpen(open); if (!open) setIsDrawingMap(false); }}>
        <DialogContent dir="rtl" className={cn("rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl transition-all", isDrawingMap ? "max-w-6xl h-[80vh]" : "max-w-md")}>
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-2xl font-black text-slate-900">{editingLand ? "تعديل معلومات الأرض" : "إضافة أرض زراعية جديدة"}</DialogTitle>
          </DialogHeader>

          {isDrawingMap ? (
            <div className="flex-1 p-8 h-full">
              <LeafletLandDrawing
                initialCoordinates={landForm.coordinates}
                onSave={(coords, area) => {
                  setLandForm(p => ({ ...p, coordinates: coords, area: area.toString() }));
                  setIsDrawingMap(false);
                  toast.success("تم تحديد المساحة بدقة");
                }}
                onCancel={() => setIsDrawingMap(false)}
              />
            </div>
          ) : (
            <form onSubmit={onLandSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold">اسم القطعة الأرضية</Label>
                <Input placeholder="مثال: القطعة الشمالية الكبرى" value={landForm.name} onChange={e => setLandForm({ ...landForm, name: e.target.value })} required className="h-14 bg-slate-50 border-none rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label className="font-bold">الحدود المساحية</Label>
                <Button type="button" variant="outline" className="w-full h-14 rounded-xl border-dashed border-2 border-emerald-500 bg-emerald-50/30 text-emerald-700 font-bold flex gap-2 hover:bg-emerald-50" onClick={() => setIsDrawingMap(true)}>
                  <MapPin className="w-5 h-5" />
                  {landForm.coordinates.length > 0 ? "تعديل الرسم على الخريطة" : "رسم حدود الأرض على الخريطة"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">المساحة (هكتار)</Label>
                  <Input type="number" step="0.01" value={landForm.area} onChange={e => setLandForm({ ...landForm, area: e.target.value })} required className="h-14 bg-slate-50 border-none rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">الموقع</Label>
                  <Input value={landForm.location} onChange={e => setLandForm({ ...landForm, location: e.target.value })} required className="h-14 bg-slate-50 border-none rounded-xl" />
                </div>
              </div>

              <Button type="submit" className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl rounded-2xl shadow-xl shadow-primary/20">حفظ القطعة الأرضية</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Eq Dialog */}
      <Dialog open={eqDialogOpen} onOpenChange={setEqDialogOpen}>
        <DialogContent dir="rtl" className="rounded-[3rem] p-10 max-w-md border-none">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingEq ? "تعديل العتاد" : "إضافة عتاد جديد"}</DialogTitle></DialogHeader>
          <form onSubmit={onEqSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="font-bold">اسم المعدة / الآلة</Label>
              <Input value={eqForm.name} onChange={e => setEqForm({ ...eqForm, name: e.target.value })} required className="h-14 rounded-xl bg-slate-50 border-none" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">تاريخ الاقتناء</Label>
              <Input type="date" value={eqForm.purchaseDate} onChange={e => setEqForm({ ...eqForm, purchaseDate: e.target.value })} required className="h-14 rounded-xl bg-slate-50 border-none" />
            </div>
            <Button type="submit" className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white font-black text-xl rounded-2xl">تأكيد التسجيل</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Worker Dialog */}
      <Dialog open={workerDialogOpen} onOpenChange={setWorkerDialogOpen}>
        <DialogContent dir="rtl" className="rounded-[3rem] p-10 max-w-md border-none">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingWorker ? "تعديل بيانات العامل" : "تسجيل عامل جديد"}</DialogTitle></DialogHeader>
          <form onSubmit={onWorkerSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="font-bold">الاسم الرباعي</Label>
              <Input value={workerForm.name} onChange={e => setWorkerForm({ ...workerForm, name: e.target.value })} required className="h-14 rounded-xl bg-slate-50 border-none" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">رقم الهاتف</Label>
              <Input value={workerForm.phone} onChange={e => setWorkerForm({ ...workerForm, phone: e.target.value })} required className="h-14 rounded-xl bg-slate-50 border-none" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">الراتب المتفق عليه (دج)</Label>
              <Input type="number" value={workerForm.salary} onChange={e => setWorkerForm({ ...workerForm, salary: e.target.value })} required className="h-14 rounded-xl bg-slate-50 border-none" />
            </div>
            <Button type="submit" className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded-2xl">تثبيت العامل</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Badge({ children, className, variant }: any) {
  return <span className={cn("px-2 py-0.5 text-[10px] font-bold", className)}>{children}</span>;
}