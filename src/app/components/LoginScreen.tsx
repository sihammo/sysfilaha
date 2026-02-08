import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LogIn, ShieldCheck, Sprout } from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";
import BrandingLogo from "./BrandingLogo";

interface LoginScreenProps {
  onLogin: (user: any, token: string) => void;
  onRegisterClick: () => void;
}

export default function LoginScreen({ onLogin, onRegisterClick }: LoginScreenProps) {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [publicStats, setPublicStats] = useState({
    totalFarmers: 2,
    totalArea: 1000
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.auth.getPublicStats();
        setPublicStats({
          totalFarmers: data.totalFarmers,
          totalArea: data.totalArea
        });
      } catch (e) {
        console.error("Failed to fetch public stats");
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Live update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await api.auth.login({
        nationalId: formData.identifier,
        password: formData.password
      });

      onLogin(data.user, data.token);
      toast.success(`مرحباً بك مجدداً، ${data.user.firstName}`);
    } catch (error: any) {
      toast.error(error.message || "بيانات الدخول غير صحيحة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden bg-background" dir="rtl">
      {/* Left Side: Modern Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col justify-center px-8 lg:px-24 py-12 z-10 bg-white"
      >
        <div className="max-w-md w-full mx-auto space-y-10">
          <header className="space-y-4 md:space-y-3 text-right">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-end"
            >
              <BrandingLogo className="mb-2 md:mb-4" isBilingual />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">إدارة ذكية للزراعة الجزائرية</h1>
            <p className="text-muted-foreground text-base md:text-lg">مرحباً بك في المنصة المتكاملة لربط الفلاحين رقمياً.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier">اسم المستخدم أو رقم التعريف الوطني</Label>
              <div className="relative group">
                <Input
                  id="identifier"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  required
                  placeholder="رقم البطاقة الوطنية"
                  className="pl-4 pr-12 h-14 bg-muted/30 border-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 ring-1 ring-border shadow-sm placeholder:text-muted-foreground/50 rounded-xl"
                />
                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">كلمة المرور</Label>
                <button type="button" className="text-sm font-bold text-primary hover:underline">نسيت كلمة المرور؟</button>
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="••••••••"
                className="h-14 bg-muted/30 border-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 ring-1 ring-border shadow-sm rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/25 transition-all active:scale-[0.98] flex gap-3"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <LogIn className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-6 border-t border-slate-100">
            <p className="text-center text-slate-500 mb-6 font-medium">ليس لديك حساب؟</p>
            <Button
              variant="outline"
              onClick={onRegisterClick}
              className="w-full h-14 border-slate-200 hover:bg-slate-50 hover:border-primary/30 text-slate-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              إنشاء حساب جديد كفلاح
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Right Side: Visual & Stats */}
      <div className="hidden lg:flex relative flex-col justify-between p-16 overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center mix-blend-overlay opacity-20" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/30 inline-block shadow-2xl"
          >
            <blockquote className="text-2xl font-medium leading-relaxed italic text-white">
              "الرقمنة هي مفتاح الأمن الغذائي المستدام. منصة الفلاح توفر لك الأدوات اللازمة للنجاح."
            </blockquote>
          </motion.div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-8 text-white">
          <div className="space-y-2">
            <p className="text-primary-foreground/60 font-bold uppercase tracking-wider text-xs">إحصائيات المنصة</p>
            <div className="flex items-baseline gap-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={publicStats.totalFarmers}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-5xl font-black tabular-nums"
                >
                  {publicStats.totalFarmers.toLocaleString()}+
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="text-lg font-medium opacity-80">فلاح مسجل عبر القطر الوطني</p>
          </div>
          <div className="space-y-2">
            <p className="text-primary-foreground/60 font-bold uppercase tracking-wider text-xs">المساحات المسجلة</p>
            <div className="flex items-baseline gap-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={publicStats.totalArea}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-5xl font-black tabular-nums"
                >
                  {Math.round(publicStats.totalArea / 1000).toLocaleString()}k
                </motion.span>
              </AnimatePresence>
              <span className="text-xl font-bold opacity-60">هكتار</span>
            </div>
            <p className="text-lg font-medium opacity-80">تمت رقمنتها بالكامل</p>
          </div>
        </div>
      </div>
    </div>
  );
}
