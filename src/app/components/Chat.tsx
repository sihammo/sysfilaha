import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  sender: "farmer" | "admin";
  senderName: string;
  message: string;
  timestamp: string;
}

interface ChatProps {
  currentUser: any;
  isAdmin: boolean;
}

export default function Chat({ currentUser, isAdmin }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat_messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    // Mark as read
    setUnreadCount(0);
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: isAdmin ? "admin" : "farmer",
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      message: messageText,
      timestamp: new Date().toLocaleString("ar-DZ"),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem("chat_messages", JSON.stringify(updatedMessages));
    setMessageText("");
    toast.success("تم إرسال الرسالة");
  };

  const handleClearChat = () => {
    if (confirm("هل تريد حذف جميع الرسائل؟")) {
      setMessages([]);
      localStorage.removeItem("chat_messages");
      toast.success("تم حذف الرسائل");
    }
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="فتح الدعم والمساعدة المباشرة"
        className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-40 flex items-center justify-center"
      >
        <MessageSquare className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-full z-50 shadow-2xl rounded-lg overflow-hidden bg-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">الدعم {isAdmin ? "من الإدارة" : "مع الإدارة"}</h3>
              <p className="text-sm text-green-100">احصل على الدعم المباشر</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              title="إغلاق نافذة الدعم"
              className="p-1 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto bg-gray-50 p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-gray-500">
                <div>
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>لا توجد رسائل حتى الآن</p>
                  <p className="text-sm mt-1">ابدأ محادثة جديدة</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === (isAdmin ? "admin" : "farmer")
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === (isAdmin ? "admin" : "farmer")
                        ? "bg-green-600 text-white rounded-br-none"
                        : "bg-gray-300 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1">
                      {msg.senderName}{" "}
                      {msg.sender === "admin" ? "👨‍💼" : "👨‍🌾"}
                    </p>
                    <p className="break-words">{msg.message}</p>
                    <p className="text-xs mt-1 opacity-70">{msg.timestamp}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
            <div className="flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="اكتب رسالتك..."
                className="flex-1 text-sm"
              />
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white p-2"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Footer */}
          {messages.length > 0 && (
            <div className="border-t px-4 py-2 bg-gray-50 flex justify-between items-center text-xs">
              <span className="text-gray-600">{messages.length} رسالة</span>
              <button
                onClick={handleClearChat}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                مسح
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
