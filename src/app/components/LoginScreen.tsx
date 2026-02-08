import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Sprout, LogIn, UserPlus, ShieldCheck, Leaf, Tractor, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import api from "../utils/api";

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
          <header className="space-y-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 text-primary"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center p-2.5">
                <Sprout className="w-full h-full" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">سيس فلاح <span className="text-primary font-light">| SysFilaha</span></span>
            </motion.div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight leading-tight">نظام الإدارة الفلاحية الذكي</h1>
            <p className="text-muted-foreground text-lg">مرحباً بك في المنصة الوطنية للرقمنة الفلاحية بالجزائر.</p>
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
                <button type="button" className="text-sm font-medium text-primary hover:underline">نسيت كلمة المرور؟</button>
              </div>
              <div className="relative group">
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="أدخل كلمة المرور"
                  className="pl-4 pr-12 h-14 bg-muted/30 border-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 ring-1 ring-border shadow-sm placeholder:text-muted-foreground/50 rounded-xl"
                />
                <LogIn className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول
                </>
              )}
            </Button>
          </form>

          <div className="pt-8 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-muted-foreground font-semibold">ليس لديك حساب؟</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={onRegisterClick}
              variant="outline"
              className="w-full h-14 border-2 border-primary/20 text-primary hover:bg-primary/5 font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              <UserPlus className="w-5 h-5" />
              طلب تسجيل مكتب فلاحي جديد
              <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Button>
          </div>

          <footer className="pt-8 text-center">
            <p className="text-xs text-muted-foreground">© 2026 وزارة الفلاحة والتنمية الريفية - جميع الحقوق محفوظة</p>
          </footer>
        </div>
      </motion.div>

      {/* Right Side: Imagery and Social Proof */}
      <div className="hidden lg:block relative overflow-hidden bg-primary/5">
        <div className="absolute inset-0 z-10 bg-gradient-to-l from-transparent to-black/40" />
        <img
          src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=2070"
          alt="Agriculture in Algeria"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-[1px]"
        />

        <div className="absolute inset-0 z-20 flex flex-col justify-end p-20 text-white space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/30 inline-block shadow-2xl">
              <blockquote className="text-2xl font-medium leading-relaxed italic">
                "الرقمنة هي مفتاح الأمن الغذائي المستدام. سيس فلاح يوفر لك الأدوات اللازمة للنجاح."
              </blockquote>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-10">
              <div className="bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">+50,000</p>
                  <p className="text-sm text-white/70">فلاح مسجل</p>
                </div>
              </div>
              <div className="bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Tractor className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1.2M</p>
                  <p className="text-sm text-white/70">هكتار ممسوح</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-amber-500/20 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
