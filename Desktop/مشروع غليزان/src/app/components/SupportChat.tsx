import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
    Send,
    MessageSquare,
    AlertCircle,
    Sprout,
    Dog,
    Droplets,
    HelpCircle,
    Clock,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    role: "farmer" | "admin";
    category: "crop_complaint" | "livestock_issue" | "irrigation_fertilizer" | "general_inquiry";
    text: string;
    timestamp: string;
    status: "sent" | "read";
}

const CATEGORIES = {
    crop_complaint: { label: "شكوى محصول", icon: Sprout, color: "text-rose-500", bg: "bg-rose-50" },
    livestock_issue: { label: "مشكلة مواشي", icon: Dog, color: "text-amber-500", bg: "bg-amber-50" },
    irrigation_fertilizer: { label: "سقي أو تسميد", icon: Droplets, color: "text-blue-500", bg: "bg-blue-50" },
    general_inquiry: { label: "استفسار عام", icon: HelpCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
};

export default function SupportChat({ currentUser }: { currentUser: any }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<keyof typeof CATEGORIES | null>(null);
    const [inputText, setInputText] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem("support_messages");
        if (saved) setMessages(JSON.parse(saved));

        const handleStorage = () => {
            const updated = localStorage.getItem("support_messages");
            if (updated) setMessages(JSON.parse(updated));
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const saveMessages = (updated: Message[]) => {
        setMessages(updated);
        localStorage.setItem("support_messages", JSON.stringify(updated));
    };

    const handleSendMessage = () => {
        if (!inputText.trim() || !selectedCategory) return;

        const newMessage: Message = {
            id: Math.random().toString(36).substr(2, 9),
            senderId: currentUser.id,
            senderName: `${currentUser.firstName} ${currentUser.lastName}`,
            role: currentUser.role,
            category: selectedCategory,
            text: inputText,
            timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
            status: "sent",
        };

        saveMessages([...messages, newMessage]);
        setInputText("");
        // We keep the category selected for follow-up if needed, 
        // but the user's requirement says "asked first", so maybe reset after send?
        // Let's reset to improve the "re-categorize" flow.
        setSelectedCategory(null);
    };

    // Farmer's View
    if (currentUser.role === "farmer") {
        const myMessages = messages.filter(m => m.senderId === currentUser.id || (m.role === "admin" && messages.find(om => om.id === m.id)));
        // Simplified: Admin can just broadcast or reply. For demo, we show all admin messages in chat.

        return (
            <div className="max-w-2xl mx-auto h-[70vh] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">مركز الدعم الفني</h2>
                        <p className="text-sm text-slate-500">تواصل مباشرة مع الإدارة لحل مشاكلك</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        النظام متصل
                    </div>
                </div>

                <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-xl bg-white/80 backdrop-blur-md rounded-3xl">
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-4"
                    >
                        {messages.filter(m => m.senderId === currentUser.id || m.role === "admin").map((msg) => (
                            <motion.div
                                initial={{ opacity: 0, x: msg.role === "admin" ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={msg.id}
                                className={`flex ${msg.role === "admin" ? "justify-start" : "justify-end"}`}
                            >
                                <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === "admin"
                                    ? "bg-white border border-slate-100 shadow-sm rounded-tr-none"
                                    : "bg-[var(--agri-green-growth)] text-white shadow-lg shadow-green-900/10 rounded-tl-none"
                                    }`}>
                                    {msg.role === "farmer" && (
                                        <div className="flex items-center gap-2 mb-1 opacity-80">
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 rounded">
                                                {CATEGORIES[msg.category]?.label}
                                            </span>
                                        </div>
                                    )}
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                    <div className={`text-[9px] mt-2 flex items-center gap-1 ${msg.role === "admin" ? "text-slate-400" : "text-white/60"}`}>
                                        <Clock className="w-3 h-3" />
                                        {msg.timestamp}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                                <MessageSquare className="w-12 h-12 opacity-20" />
                                <p>لا توجد مراسلات سابقة</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-4">
                        {!selectedCategory ? (
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-slate-500 mr-1">اختر تصنيف الرسالة أولاً:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(CATEGORIES).map(([key, cfg]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedCategory(key as any)}
                                            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-right"
                                        >
                                            <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                                            <span className="text-xs font-medium text-slate-700">{cfg.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${CATEGORIES[selectedCategory].color.replace('text', 'bg')}`} />
                                        <span className="text-[10px] font-bold text-slate-500">{CATEGORIES[selectedCategory].label}</span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className="text-[10px] text-rose-500 hover:underline"
                                    >
                                        تغيير التصنيف
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        value={inputText}
                                        onChange={e => setInputText(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="اكتب رسالتك هنا..."
                                        className="rounded-xl border-slate-200 focus:ring-[var(--agri-green-growth)]"
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        className="bg-[var(--agri-green-growth)] rounded-xl px-6"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    // Admin's View
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">بريد التواصل الإداري</h2>
                <p className="text-sm text-slate-500">إدارة طلبات واستفسارات الفلاحين</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                        <div className="p-4 bg-slate-800 text-white text-xs font-bold">التصنيفات</div>
                        <div className="p-2 space-y-1">
                            {Object.entries(CATEGORIES).map(([key, cfg]) => (
                                <div key={key} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                                        <span className="text-xs font-medium text-slate-700">{cfg.label}</span>
                                    </div>
                                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                        {messages.filter(m => m.category === key && m.role === "farmer").length}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="md:col-span-3 space-y-4">
                    {messages.filter(m => m.role === "farmer").reverse().map((msg) => (
                        <Card key={msg.id} className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-4 flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${CATEGORIES[msg.category]?.bg}`}>
                                    {(() => {
                                        const Icon = CATEGORIES[msg.category]?.icon;
                                        return Icon ? <Icon className={`w-5 h-5 ${CATEGORIES[msg.category].color}`} /> : null;
                                    })()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-bold text-slate-800">{msg.senderName}</p>
                                        <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{msg.text}</p>
                                    <div className="mt-4 flex gap-2">
                                        <Input
                                            placeholder="اكتب ردك هنا..."
                                            className="text-xs h-8 rounded-lg bg-slate-50 border-none"
                                        />
                                        <Button size="sm" className="bg-slate-800 h-8 rounded-lg text-xs">
                                            إرسال الرد
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {messages.filter(m => m.role === "farmer").length === 0 && (
                        <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                            <MessageSquare className="w-12 h-12 opacity-10 mx-auto mb-2" />
                            <p>لا توجد رسائل واردة حالياً</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
