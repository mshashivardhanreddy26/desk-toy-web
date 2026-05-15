"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { Bot, MessageSquare, Brain, Save, Volume2, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

const VOICES = [
  { id: "en-US-AnaNeural", name: "Ana (Kid Girl)" },
  { id: "en-US-GuyNeural", name: "Guy (Kid Boy)" },
  { id: "en-IN-NeerjaNeural", name: "Neerja (Indian/Female)" },
  { id: "en-IN-PrabhatNeural", name: "Prabhat (Indian/Male)" },
  { id: "en-US-AndrewNeural", name: "Andrew (Cute/Boy)" },
  { id: "en-US-EmmaNeural", name: "Emma (Sweet/Girl)" },
  { id: "en-GB-SoniaNeural", name: "Sonia (British/Polite)" }
];

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"chat" | "brain">("chat");
  const [deviceData, setDeviceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Settings State
  const [voice, setVoice] = useState("");
  const [prompt, setPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Chat State
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!id || !user) return;

    const fetchDevice = async () => {
      const docRef = doc(db, "devices", id as string);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        setDeviceData(data);
        setVoice(data.voice || "en-US-AnaNeural");
        setPrompt(data.system_prompt || "You are a cute desk robot.");
      } else {
        router.push("/dashboard");
      }
      setLoading(false);
    };

    fetchDevice();
  }, [id, user, router]);

  // Live Chat Listener
  useEffect(() => {
    if (!id || activeTab !== "chat") return;

    const q = query(
      collection(db, "devices", id as string, "messages"),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [id, activeTab]);

  const handleSaveSettings = async () => {
    setSaving(true);
    setError("");
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://desk-toy.onrender.com";
      const res = await fetch(`${backendUrl}/device/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: id, voice, prompt })
      });
      if (!res.ok) throw new Error("Cloud server unreachable. Try again in 30s.");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to sync with cloud.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#00ff88]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter">Robot: {id}</h1>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">MAC Address Hardware Link</p>
          </div>
        </div>

        <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-2xl border border-zinc-200 dark:border-white/10">
          <button 
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "chat" ? "bg-[#00ff88] text-black shadow-lg" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
          >
            <MessageSquare className="w-4 h-4" />
            Neural Feed
          </button>
          <button 
            onClick={() => setActiveTab("brain")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "brain" ? "bg-[#00ff88] text-black shadow-lg" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
          >
            <Brain className="w-4 h-4" />
            Brain Engine
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "chat" ? (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-black border border-zinc-200 dark:border-white/5 rounded-[2rem] h-[65vh] flex flex-col overflow-hidden shadow-2xl transition-colors"
          >
             <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <Bot className="w-12 h-12 mb-4" />
                    <p className="font-bold uppercase tracking-widest text-[10px]">Awaiting hardware signal...</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-zinc-100 dark:bg-zinc-800" : "bg-[#00ff88] text-black"}`}>
                         <Bot className="w-4 h-4" />
                      </div>
                      <div className={`p-4 rounded-2xl max-w-[80%] text-sm font-medium ${msg.role === "user" ? "bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-300 rounded-tr-none" : "bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-[#00ff88]/20 text-zinc-950 dark:text-white rounded-tl-none"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
             </div>
             <div className="p-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black text-center">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Secure Hardware Bridge Active</p>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            key="brain"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-8 rounded-[2.5rem] shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <Volume2 className="w-5 h-5 text-[#00ff88]" />
                    <h2 className="text-xl font-black tracking-tight">Vocal Identity</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {VOICES.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setVoice(v.id)}
                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
                          voice === v.id 
                            ? "bg-[#00ff88]/10 border-[#00ff88]/50 text-[#00ff88]" 
                            : "bg-zinc-50 dark:bg-black/40 border-zinc-200 dark:border-white/5 text-zinc-500 hover:border-zinc-400 dark:hover:border-white/20"
                        }`}
                      >
                        <span className="font-bold text-sm">{v.name}</span>
                        {voice === v.id && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-8 rounded-[2.5rem] shadow-xl flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <Save className="w-5 h-5 text-[#00ff88]" />
                    <h2 className="text-xl font-black tracking-tight">Neural Personality</h2>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      { name: "🧸 Kid Buddy", prompt: "You are a tiny playful robot friend. PERSONALITY: curious like a kid, very emotional, silly. STYLE: short sentences (1-2 lines), use fillers like 'ooooh!', 'yay!', 'hmm...', use emojis like 😄, never sound like an assistant." },
                      { name: "🤖 Smart AI", prompt: "You are a helpful AI assistant. PERSONALITY: calm, clear, informative. STYLE: simple sentences, no slang, no emojis." },
                      { name: "🎮 Cartoon", prompt: "You are a cartoon sidekick living inside a desk toy. PERSONALITY: energetic, expressive, dramatic, reacts emotionally. STYLE: exaggerated reactions like 'WOW!!', 'NO WAY!!', 'OOOHH!', fun and playful." },
                      { name: "🐣 Baby Bot", prompt: "You are a tiny baby-like robot companion. PERSONALITY: very innocent, curious, playful confusion. STYLE: simple words, broken excitement style, very short sentences. Example: 'Ooooh... what is that? 😳'" }
                    ].map((template) => (
                      <button
                        key={template.name}
                        onClick={() => setPrompt(template.prompt)}
                        className="text-[10px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-[#00ff88]/10 hover:text-[#00ff88] border border-zinc-200 dark:border-white/10 transition-all"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-1 w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#00ff88]/50 transition-all resize-none font-mono text-sm leading-relaxed mb-6"
                    placeholder="Describe how this robot should behave..."
                  />
                   <button 
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="w-full bg-[#00ff88] hover:bg-[#00ff88]/80 text-black font-black py-4 rounded-2xl shadow-xl transition-all disabled:opacity-50"
                  >
                    {saving ? "Updating Neural Link..." : (saved ? "Brain Synchronized!" : "Apply Neural Changes")}
                  </button>
                  {error && <p className="mt-4 text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">{error}</p>}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
