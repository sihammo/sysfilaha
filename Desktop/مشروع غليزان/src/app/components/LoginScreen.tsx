import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Sprout, LogIn, UserPlus, ArrowRight, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface LoginScreenProps {
  onLogin: (user: any) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    firstName: "",
    lastName: "",
    nationalId: "",
    farmerCardNumber: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Try to login
    const user = users.find((u: any) => {
      // Admin check
      if (u.role === "admin") {
        return u.password === formData.password && (formData.identifier === "admin" || formData.identifier === u.firstName);
      }
      // Farmer check
      return u.role === "farmer" && u.nationalId === formData.identifier && u.password === formData.password;
    });

    if (user) {
      if (user.role === "farmer" && user.status === "pending") {
        toast.info("حسابك قيد المراجعة. يرجى الانتظار حتى يتم تفعيل حسابك من قبل المسؤول (خلال 24 ساعة).", {
          icon: <Clock className="w-5 h-5 text-amber-500" />
        });
        return;
      }
      if (user.role === "farmer" && user.status === "rejected") {
        toast.error("تم رفض طلبك. يرجى الاتصال بالإدارة.");
        return;
      }

      onLogin(user);
      toast.success(`مرحباً ${user.firstName} ${user.lastName}`);
    } else {
      toast.error("بيانات الدخول غير صحيحة");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if user already exists
    if (users.find((u: any) => u.nationalId === formData.nationalId)) {
      toast.error("رقم التعريف الوطني مسجل مسبقاً");
      return;
    }

    const newUser = {
      id: `farmer-${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      nationalId: formData.nationalId,
      farmerCardNumber: formData.farmerCardNumber,
      role: "farmer",
      password: formData.password,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("users", JSON.stringify([...users, newUser]));
    toast.success("تم إرسال طلبك بنجاح! سيقوم المسؤول بمراجعته وتفعيل حسابك قريباً.", {
      duration: 6000,
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
    });
    setIsRegistering(false);
    setStep(1);
    setFormData({ ...formData, identifier: formData.nationalId }); // Auto-fill for login
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -20 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--agri-beige-warm)] p-4 font-sans" dir="rtl">
      <AnimatePresence mode="wait">
        {!isRegistering ? (
          <motion.div
            key="login"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-md"
          >
            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
              <div className="bg-[var(--agri-green-growth)] p-8 text-center text-white">
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Sprout className="w-10 h-10 text-[var(--agri-green-soft)]" />
                </motion.div>
                <CardTitle className="text-3xl font-bold">سند المزرعة</CardTitle>
                <CardDescription className="text-green-100 mt-2 opacity-80">نظام إدارة الفلاحة الرقمي</CardDescription>
              </div>

              <CardContent className="p-8 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">اسم المستخدم أو رقم التعريف الوطني</Label>
                    <Input
                      id="identifier"
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                      required
                      placeholder="رقم بطاقة التعريف الوطنية"
                      className="rounded-xl border-slate-200 focus:ring-[var(--agri-green-growth)] py-6 text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      placeholder="••••••••"
                      className="rounded-xl border-slate-200 focus:ring-[var(--agri-green-growth)] py-6 text-right"
                    />
                  </div>
                  <Button type="submit" className="w-full py-6 rounded-xl bg-[var(--agri-green-growth)] hover:bg-green-800 transition-all font-bold text-lg">
                    <LogIn className="w-5 h-5 ml-2" />
                    دخول للمنصة
                  </Button>
                </form>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400">أو</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setIsRegistering(true)}
                  className="w-full py-6 rounded-xl border-dashed border-slate-300 text-slate-600 hover:bg-green-50 hover:text-[var(--agri-green-growth)]"
                >
                  <UserPlus className="w-5 h-5 ml-2" />
                  إنشاء حساب جديد كفلاح
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="register"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-lg"
          >
            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
              <div className="bg-[var(--agri-green-growth)] p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-[var(--agri-green-soft)]" />
                  <div>
                    <h2 className="text-xl font-bold">تسجيل فلاح جديد</h2>
                    <p className="text-xs text-green-100/70">الخطوة {step} من 3</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsRegistering(false)}
                  className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress Bar (as seen in Image 0) */}
              <div className="bg-slate-50 h-2 w-full flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / 3) * 100}%` }}
                  className="bg-[var(--agri-green-soft)] h-full"
                />
              </div>

              <CardContent className="p-8">
                <form onSubmit={handleRegister} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>الاسم الأول</Label>
                            <Input
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              required
                              placeholder="أدخل اسمك"
                              className="rounded-xl py-6"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>اللقب</Label>
                            <Input
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              required
                              placeholder="أدخل لقبك"
                              className="rounded-xl py-6"
                            />
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-sm text-blue-800">
                          <CheckCircle2 className="w-5 h-5 shrink-0" />
                          <p>يرجى التأكد من كتابة معلوماتك كما هي مذكورة في بطاقة التعريف الرسمية.</p>
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label>رقم التعريف الوطني (18 رقم)</Label>
                          <Input
                            value={formData.nationalId}
                            onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                            required
                            placeholder="أدخل رقمك الوطني"
                            className="rounded-xl py-6 text-right"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>رقم بطاقة الفلاح (اختياري)</Label>
                          <Input
                            value={formData.farmerCardNumber}
                            onChange={(e) => setFormData({ ...formData, farmerCardNumber: e.target.value })}
                            placeholder="FC-000000"
                            className="rounded-xl py-6 text-right"
                          />
                        </div>
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 text-sm text-amber-800">
                          <Clock className="w-5 h-5 shrink-0" />
                          <p>سيتم استخدام رقم التعريف الوطني كاسم مستخدم خاص بك في النظام.</p>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label>كلمة المرور</Label>
                          <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            placeholder="أدخل كلمة مرور قوية"
                            className="rounded-xl py-6"
                          />
                        </div>
                        <div className="bg-[var(--agri-beige-warm)] p-6 rounded-2xl border border-[var(--agri-green-soft)]/30 text-center">
                          <h4 className="font-bold text-lg mb-2 text-[var(--agri-green-growth)]">مراجعة الطلب</h4>
                          <p className="text-slate-600">بمجرد الإرسال، سيتم تحويل ملفك للإدارة للمراجعة. سيتم تفعيل حسابك في أقل من 24 ساعة.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-4 pt-4">
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep(step - 1)}
                        className="px-8 rounded-xl h-14"
                      >
                        <ArrowRight className="w-5 h-5 ml-2" />
                        السابق
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className="flex-1 rounded-xl bg-[var(--agri-green-growth)] hover:bg-green-800 h-14 font-bold text-lg"
                    >
                      {step === 3 ? "إرسال طلب التسجيل" : "الخطوة التالية"}
                      {step < 3 && <ArrowLeft className="w-5 h-5 mr-2" />}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}