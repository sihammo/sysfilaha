import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
    Bell,
    Droplets,
    FlaskConical,
    Bug,
    Calendar,
    Plus,
    Trash2,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ShoppingCart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Reminder {
    id: string;
    type: "irrigation" | "fertilization" | "pollination" | "harvest" | "other";
    title: string;
    date: string;
    priority: "high" | "medium" | "low";
    completed: boolean;
    createdAt: string;
}

const TYPE_CONFIG = {
    irrigation: { label: "سقي", icon: Droplets, color: "text-blue-500", bg: "bg-blue-50" },
    fertilization: { label: "تسميد", icon: FlaskConical, color: "text-emerald-500", bg: "bg-emerald-50" },
    pollination: { label: "تلقيح", icon: Bug, color: "text-amber-500", bg: "bg-amber-50" },
    harvest: { label: "حصاد/بيع", icon: ShoppingCart, color: "text-rose-500", bg: "bg-rose-50" },
    other: { label: "أخرى", icon: Bell, color: "text-slate-500", bg: "bg-slate-50" },
};

const PRIORITY_CONFIG = {
    high: { label: "عاجل", color: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50" },
    medium: { label: "متوسط", color: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50" },
    low: { label: "لاحق", color: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50" },
};

export default function FarmerReminders({ userId }: { userId: string }) {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
        type: "irrigation",
        priority: "medium",
        title: "",
        date: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        const saved = localStorage.getItem(`reminders_${userId}`);
        if (saved) setReminders(JSON.parse(saved));
    }, [userId]);

    const saveReminders = (updated: Reminder[]) => {
        setReminders(updated);
        localStorage.setItem(`reminders_${userId}`, JSON.stringify(updated));
    };

    const handleAdd = () => {
        if (!newReminder.title) return toast.error("يرجى إدخال عنوان للتذكير");

        const reminder: Reminder = {
            id: Math.random().toString(36).substr(2, 9),
            type: newReminder.type as any,
            title: newReminder.title as string,
            date: newReminder.date as string,
            priority: newReminder.priority as any,
            completed: false,
            createdAt: new Date().toISOString(),
        };

        saveReminders([reminder, ...reminders]);
        setIsAdding(false);
        setNewReminder({
            type: "irrigation",
            priority: "medium",
            title: "",
            date: new Date().toISOString().split("T")[0],
        });
        toast.success("تم إضافة التذكير بنجاح");
    };

    const toggleComplete = (id: string) => {
        saveReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    };

    const deleteReminder = (id: string) => {
        saveReminders(reminders.filter(r => r.id !== id));
        toast.info("تم حذف التذكير");
    };

    const sortedReminders = [...reminders].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const pSteps = { high: 0, medium: 1, low: 2 };
        if (a.priority !== b.priority) return pSteps[a.priority] - pSteps[b.priority];
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#2D5A27]">تنبيهات المزرعة</h2>
                    <p className="text-gray-600">نظم مهامك اليومية ومواعيد السقي والحصاد</p>
                </div>
                <Button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-[var(--agri-green-growth)] rounded-xl py-6 px-8 flex gap-2 shadow-lg hover:scale-105 transition-all"
                >
                    {isAdding ? <Clock className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {isAdding ? "عرض المهام" : "إضافة موعد جديد"}
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {isAdding ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>نوع المهمة</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => setNewReminder(p => ({ ...p, type: key as any }))}
                                                        className={`
                                        flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                                        ${newReminder.type === key
                                                                ? "border-[var(--agri-green-growth)] bg-[var(--agri-green-soft)]/10"
                                                                : "border-gray-100 hover:border-gray-200"
                                                            }
                                    `}
                                                    >
                                                        <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
                                                        <span className="text-sm font-medium">{cfg.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>عنوان التذكير</Label>
                                            <Input
                                                placeholder="مثلاً: سقي حقل القمح الجنوبي"
                                                value={newReminder.title}
                                                onChange={e => setNewReminder(p => ({ ...p, title: e.target.value }))}
                                                className="rounded-xl border-gray-200 focus:ring-[var(--agri-green-growth)]"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>التاريخ</Label>
                                                <Input
                                                    type="date"
                                                    value={newReminder.date}
                                                    onChange={e => setNewReminder(p => ({ ...p, date: e.target.value }))}
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>الأولوية</Label>
                                                <select
                                                    value={newReminder.priority}
                                                    onChange={e => setNewReminder(p => ({ ...p, priority: e.target.value as any }))}
                                                    className="w-full p-2 border border-gray-200 rounded-xl bg-white text-sm"
                                                >
                                                    <option value="high">عاجل (أحمر)</option>
                                                    <option value="medium">متوسط (برتقالي)</option>
                                                    <option value="low">لاحق (أزرق)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleAdd}
                                            className="w-full bg-[var(--agri-green-growth)] rounded-xl py-6 mt-4 shadow-lg shadow-green-900/10"
                                        >
                                            تأكيد الإضافة
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                    >
                        {sortedReminders.length === 0 ? (
                            <div className="col-span-full py-20 text-center space-y-4 bg-white/40 rounded-3xl border-2 border-dashed border-gray-200">
                                <Bell className="w-12 h-12 text-gray-300 mx-auto" />
                                <p className="text-gray-500 font-medium">لا توجد تنبيهات حالية، ابدأ بتنظيم جدولك!</p>
                            </div>
                        ) : sortedReminders.map((reminder) => {
                            const TypeIcon = TYPE_CONFIG[reminder.type].icon;
                            const PriorityInfo = PRIORITY_CONFIG[reminder.priority];

                            return (
                                <motion.div
                                    layout
                                    key={reminder.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`
                    relative group bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all border-l-4
                    ${reminder.completed ? "opacity-60 grayscale-[0.5]" : ""}
                    ${reminder.priority === "high" ? "border-l-rose-500 shadow-rose-900/5" :
                                            reminder.priority === "medium" ? "border-l-amber-500 shadow-amber-900/5" :
                                                "border-l-blue-500 shadow-blue-900/5"}
                  `}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className={`p-3 rounded-2xl ${TYPE_CONFIG[reminder.type].bg}`}>
                                            <TypeIcon className={`w-6 h-6 ${TYPE_CONFIG[reminder.type].color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${PriorityInfo.color} text-white`}>
                                                    {PriorityInfo.label}
                                                </span>
                                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {reminder.date}
                                                </span>
                                            </div>
                                            <h3 className={`font-bold text-gray-800 ${reminder.completed ? "line-through" : ""}`}>
                                                {reminder.title}
                                            </h3>
                                            <p className="text-[10px] text-gray-400 mt-1">مهمة: {TYPE_CONFIG[reminder.type].label}</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => toggleComplete(reminder.id)}
                                                className={`p-2 rounded-full transition-colors ${reminder.completed ? "bg-emerald-100 text-emerald-600" : "bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500"}`}
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => deleteReminder(reminder.id)}
                                                className="p-2 rounded-full bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
