import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Sprout,
  MapPin,
  ChevronLeft,
  ChevronRight,
  User,
  Info,
  CheckCircle2,
  Tractor,
  ShieldCheck,
  ArrowRight,
  ChevronLeft as ChevronLeftIcon,
  Map,
  ClipboardList
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";
import LeafletLandDrawing from "./LeafletLandDrawing";
import { cn } from "../utils/cn";

interface FarmerRegistrationProps {
  onRegister: (farmer: any) => void;
  onCancel: () => void;
}

export default function FarmerRegistration({ onRegister, onCancel }: FarmerRegistrationProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    password: "",
    phone: "",
    email: "",
    address: "",
    landArea: "",
    crops: "",
    lat: null as number | null,
    lng: null as number | null,
    coordinates: [] as { lat: number; lng: number }[],
  });

  const [selectedRegion, setSelectedRegion] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const steps = [
    { id: 1, title: "المعلومات الشخصية", icon: User },
    { id: 2, title: "موقع الأرض", icon: MapPin },
    { id: 3, title: "البيانات الزراعية", icon: ClipboardList }
  ];

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.nationalId || !formData.phone || !formData.password) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }
    if (!/^[0-9]{13}$/.test(formData.nationalId)) {
      toast.error("رقم بطاقة التعريف يجب أن يكون 13 رقم");
      return;
    }
    nextStep();
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address || !formData.landArea || !selectedRegion) {
      toast.error("الرجاء تحديد الموقع والمساحة");
      return;
    }
    nextStep();
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.crops) {
      toast.error("الرجاء إدخال تفاصيل المحاصيل");
      return;
    }
    onRegister({ ...formData, region: selectedRegion, role: "farmer", status: "pending" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-5 overflow-hidden font-sans" dir="rtl">
      {/* Sidebar Navigation */}
      <div className="hidden lg:flex lg:col-span-1 bg-slate-900 flex-col p-8 text-white relative">
        <div className="flex items-center gap-3 mb-12">
          <Sprout className="w-8 h-8 text-emerald-400" />
          <span className="font-bold text-xl">منصة الفلاح</span>
        </div>

        <div className="flex-1 space-y-8 relative">
          {/* Step Indicators */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-800" />
          {steps.map((s) => (
            <div key={s.id} className="relative flex items-center gap-6 z-10 transition-all">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500",
                step >= s.id ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-900 border-slate-700 text-slate-500"
              )}>
                {step > s.id ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
              </div>
              <div>
                <p className={cn("text-xs font-bold uppercase tracking-widest", step >= s.id ? "text-emerald-400" : "text-slate-500")}>المرحلة {s.id}</p>
                <p className={cn("text-sm font-bold", step >= s.id ? "text-white" : "text-slate-400")}>{s.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-500 leading-relaxed font-medium">
          نظام الرقمنة الفلاحية المدمج<br />2026 وزارة الفلاحة م.ف.ج
        </div>
      </div>

      {/* Main Form Area */}
      <div className="lg:col-span-4 bg-[#f8fafc] flex items-center justify-center p-6 md:p-12 relative">
        <Button
          onClick={onCancel}
          variant="ghost"
          className="absolute top-8 left-8 text-slate-400 hover:text-slate-900"
        >
          <X className="w-5 h-5 ml-2" /> العودة للرئيسية
        </Button>

        <Card className="w-full max-w-3xl border-none shadow-[0_20px_60px_rgb(0,0,0,0.03)] rounded-[2.5rem] bg-white overflow-hidden">
          <div className="h-2 w-full flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              className="bg-emerald-500 h-full"
            />
          </div>

          <CardContent className="p-8 md:p-14">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleStep1Submit}
                  className="space-y-8"
                >
                  <header>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">المعلومات الأساسية</h2>
                    <p className="text-slate-400 mt-2 font-medium">يرجى إدخال بيانات الهوية لفتح حساب الفلاح الخاص بك.</p>
                  </header>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">الاسم الأول</Label>
                      <Input name="firstName" value={formData.firstName} onChange={handleInputChange} required className="h-14 bg-slate-50 border-none rounded-2xl ring-1 ring-slate-200 focus:ring-emerald-500/20" placeholder="مثال: صالح" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">لقب العائلة</Label>
                      <Input name="lastName" value={formData.lastName} onChange={handleInputChange} required className="h-14 bg-slate-50 border-none rounded-2xl ring-1 ring-slate-200 focus:ring-emerald-500/20" placeholder="مثال: حمداني" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">رقم بطاقة التعريف الوطنية (13 رقم)</Label>
                    <Input name="nationalId" value={formData.nationalId} onChange={handleInputChange} required className="h-14 bg-slate-50 border-none rounded-2xl ring-1 ring-slate-200 focus:ring-emerald-500/20 font-mono tracking-widest text-lg" placeholder="0000000000000" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">رقم الهاتف</Label>
                      <Input name="phone" value={formData.phone} onChange={handleInputChange} required className="h-14 bg-slate-50 border-none rounded-2xl ring-1 ring-slate-200 focus:ring-emerald-500/20 font-mono" placeholder="05XXXXXXXX" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">كلمة المرور</Label>
                      <Input name="password" type="password" value={formData.password} onChange={handleInputChange} required className="h-14 bg-slate-50 border-none rounded-2xl ring-1 ring-slate-200 focus:ring-emerald-500/20" placeholder="••••••••" />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-emerald-500/20 transition-all group">
                    الانتقال لبيانات الموقع <ChevronLeft className="mr-2 w-6 h-6 group-hover:-translate-x-2 transition-transform" />
                  </Button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleStep2Submit}
                  className="space-y-8"
                >
                  <header>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">تحديد الموقع المساحي</h2>
                    <p className="text-slate-400 mt-2 font-medium">ساعدنا في تحديد موقع أرضك الزراعية ومساحتها الإجمالية.</p>
                  </header>

                  <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 relative shadow-inner">
                    <LeafletLandDrawing
                      initialCoordinates={formData.coordinates}
                      onSave={async (coords, area, representativePoint) => {
                        const point = representativePoint || coords[0];
                        // Optimistically set coordinates and area immediately
                        setFormData(prev => ({
                          ...prev,
                          coordinates: coords,
                          landArea: area.toString(),
                          lat: point?.lat,
                          lng: point?.lng
                        }));

                        // Fetch location details (Reverse Geocoding)
                        if (point) {
                          try {
                            const lat = point.lat;
                            const lng = point.lng;
                            toast.loading("جاري تحديد الموقع...", { id: "geo-fetch" });

                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`);
                            const data = await res.json();

                            // Robust extraction of Commune and Wilaya according to Algerian administrative divisions in OSM
                            const commune = data.address.city || data.address.town || data.address.village || data.address.municipality || data.address.suburb;
                            const wilaya = data.address.state || data.address.province;

                            const fullAddress = wilaya && commune
                              ? `ولاية ${wilaya}، بلدية ${commune}`
                              : (wilaya || commune || "الجزائر");

                            setFormData(prev => ({ ...prev, address: fullAddress }));
                            setSelectedRegion(wilaya || "الجزائر");

                            toast.success("تم حفظ الأرض وتحديد الموقع بنجاح", { id: "geo-fetch" });
                          } catch (error) {
                            console.error("Geocoding error:", error);
                            toast.error("تم حفظ الأرض ولكن تعذر تحديد العنوان تلقائياً", { id: "geo-fetch" });
                          }
                        }
                      }}
                      onCancel={() => { }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">البلدية / المنطقة</Label>
                      <Input name="address" value={formData.address} onChange={handleInputChange} readOnly className="h-14 bg-slate-100/50 border-none rounded-2xl italic text-slate-500 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">المساحة الإجمالية (بالهكتار)</Label>
                      <div className="relative">
                        <Input name="landArea" type="number" value={formData.landArea} onChange={handleInputChange} required className="h-14 bg-slate-50 border-none rounded-2xl ring-1 ring-slate-200 focus:ring-emerald-500/20 pr-4 pl-12" placeholder="مثال: 12" />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">HECTARE</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="ghost" onClick={prevStep} className="h-16 flex-1 text-slate-500 font-bold text-lg rounded-2xl">السابق</Button>
                    <Button type="submit" className="h-16 flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-emerald-500/20">البيانات النهائية</Button>
                  </div>
                </motion.form>
              )}

              {step === 3 && (
                <motion.form
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleFinalSubmit}
                  className="space-y-8"
                >
                  <header>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">النشاطات الفلاحية</h2>
                    <p className="text-slate-400 mt-2 font-medium">أخبرنا عما تزرعه أو تنتجه في مستثمرتك الفلاحية.</p>
                  </header>

                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">قائمة المحاصيل والمنتجات</Label>
                    <Textarea
                      name="crops"
                      value={formData.crops}
                      onChange={handleInputChange}
                      rows={5}
                      className="bg-slate-50 border-none rounded-2xl ring-1 ring-slate-200 focus:ring-emerald-500/20 p-6 text-lg leading-relaxed shadow-inner"
                      placeholder="اكتب المحاصيل التي تعتمدها، التجهيزات المتوفرة، أو نوع المستثمرة (أشجار مثمرة، حبوب، بيوت بلاستيكية...)"
                    />
                  </div>

                  <div className="p-8 bg-emerald-50/50 rounded-[2rem] border border-emerald-100/50 space-y-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                      <h4 className="font-black text-emerald-900">تأكيد نهائي للبيانات</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-slate-500 font-medium">اسم الفلاح:</span>
                      <span className="text-slate-900 font-black">{formData.firstName} {formData.lastName}</span>
                      <span className="text-slate-500 font-medium">الولاية:</span>
                      <span className="text-slate-900 font-black">{selectedRegion}</span>
                      <span className="text-slate-500 font-medium">المساحة:</span>
                      <span className="text-slate-900 font-black">{formData.landArea} هكتار</span>
                    </div>
                    <p className="text-xs text-emerald-700/60 leading-relaxed font-bold pt-2 italic">
                      * بتقديمك لهذا الطلب، أنت تقر بصحة المعلومات المقدمة وتدرك أنه سيتم التحقق منها من قبل السلطات الولائية.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="ghost" onClick={prevStep} className="h-16 flex-1 text-slate-500 font-bold text-lg rounded-2xl">تعديل السابق</Button>
                    <Button type="submit" className="h-16 flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-emerald-700/20">تقديم الطلب للمراجعة</Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  )
}
