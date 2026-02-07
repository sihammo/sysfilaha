import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Sprout, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";
import AlgeriaMap from "./AlgeriaMap";

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
    phone: "",
    email: "",
    address: "",
    landArea: "",
    crops: "",
  });

  const [selectedRegion, setSelectedRegion] = useState("");

  const algeriRegions = [
    "الجزائر (عاصمة)",
    "قسنطينة",
    "وهران",
    "تلمسان",
    "تيارت",
    "سعيدة",
    "غليزان",
    "عنابة",
    "سكيكدة",
    "جيجل",
    "بني إسماعيل",
    "تيزي وزو",
    "باتنة",
    "بسكرة",
    "الأغواط",
    "ورقلة",
    "تمنراست",
    "إليزي",
    "الوادي",
    "الجلفة",
    "لاغوات",
    "جانت",
    "دالي الأحمر",
    "سطيف",
    "باتنة",
    "بومرداس",
    "تيبازة",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.nationalId || !formData.phone) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }
    if (!/^[0-9]{13}$/.test(formData.nationalId)) {
      toast.error("رقم بطاقة التعريف يجب أن يكون 13 رقم");
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address || !formData.landArea || !selectedRegion) {
      toast.error("الرجاء ملء جميع حقول الموقع");
      return;
    }
    setStep(3);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.crops) {
      toast.error("الرجاء إدخال المحاصيل");
      return;
    }

    const newFarmer = {
      id: `farmer-${Date.now()}`,
      ...formData,
      region: selectedRegion,
      password: Math.random().toString(36).substring(7),
      role: "farmer",
      approved: false,
      status: "pending",
      registrationDate: new Date().toISOString(),
    };

    onRegister(newFarmer);
    toast.success("تم إرسال طلب التسجيل! سيتم مراجعته من قبل الإدارة");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-amber-50 to-green-100 p-4" dir="rtl">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Sprout className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">تسجيل فلاح جديد</CardTitle>
            <p className="text-green-100 mt-2">الخطوة {step} من 3</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-8">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <h3 className="text-lg font-semibold text-green-800">المعلومات الشخصية</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">الاسم الأول</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="محمد"
                    required
                    className="text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">اسم العائلة</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="بن علي"
                    required
                    className="text-lg"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="nationalId">رقم بطاقة التعريف (13 رقم)</Label>
                <Input
                  id="nationalId"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleInputChange}
                  placeholder="1234567890123"
                  required
                  className="text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+213-XXX-XXX-XXX"
                    required
                    className="text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className="text-lg"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  التالي
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Location and Land */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                موقع الأرض الزراعية
              </h3>

              {/* Interactive Algeria Map */}
              <div>
                <AlgeriaMap
                  selectedRegion={selectedRegion}
                  onRegionSelect={setSelectedRegion}
                />
              </div>

              <div>
                <Label htmlFor="address">العنوان (المدينة / البلدية)</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="اسم المدينة أو البلدية"
                  required
                  className="text-lg"
                />
              </div>

              <div>
                <Label htmlFor="landArea">مساحة الأرض الزراعية (هكتار)</Label>
                <Input
                  id="landArea"
                  name="landArea"
                  type="number"
                  value={formData.landArea}
                  onChange={handleInputChange}
                  placeholder="مثال: 5"
                  required
                  className="text-lg"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                <p>📍 تحديد موقع أرضك:</p>
                <p className="mt-2">سيتم استخدام بيانات موقعك لدعم الإدارة في عمليات التفتيش والإشراف والحماية من الممارسات الضارة.</p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  التالي
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  السابق
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Agricultural Information */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <h3 className="text-lg font-semibold text-green-800">المعلومات الزراعية</h3>

              <div>
                <Label htmlFor="crops">المحاصيل والمنتجات الزراعية</Label>
                <Textarea
                  id="crops"
                  name="crops"
                  value={formData.crops}
                  onChange={handleInputChange}
                  placeholder="اكتب المحاصيل التي تزرعها (مثال: قمح، شعير، تمر، إلخ)"
                  required
                  className="text-lg"
                  rows={4}
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                <p className="font-semibold">✓ ملخص التسجيل:</p>
                <ul className="mt-2 space-y-1">
                  <li>الاسم: {formData.firstName} {formData.lastName}</li>
                  <li>الولاية: {selectedRegion}</li>
                  <li>مساحة الأرض: {formData.landArea} هكتار</li>
                </ul>
                <p className="mt-3 text-xs">يرجى التأكد من أن جميع البيانات صحيحة. سيتم التحقق منها من قبل الإدارة.</p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  تقديم الطلب
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  السابق
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
