"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AddDevice() {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "searching" | "found" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) return;
    
    setStatus("searching");
    setErrorMessage("");
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://desk-toy.onrender.com";
      const response = await fetch(`${backendUrl}/device/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.uid || "",
          registration_code: code
        })
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setStatus("found");
      } else {
        setStatus("error");
        setErrorMessage(data.detail || "Invalid or expired code. Please check your Product's screen.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("Could not connect to the registration server.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 md:mt-10 pb-20">
      <header className="mb-8 md:mb-10 text-center">
        <div className="w-16 h-16 bg-[#00ff88]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#00ff88]/20">
          <ShieldCheck className="w-8 h-8 text-[#00ff88]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 text-zinc-950 dark:text-white">Secure Link</h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium px-4">
          Turn on your physical hardware and enter the 6-digit synchronization code displayed on its screen.
        </p>
      </header>

      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden shadow-2xl transition-all duration-300">
        {status === "searching" && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent animate-[pulse_1s_ease-in-out_infinite]" />
        )}

        <form onSubmit={handleAdd} className="space-y-6 md:space-y-8">
          <div>
            <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-4 text-center">Verification Code</label>
            <div className="relative">
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000" 
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-6 text-zinc-950 dark:text-white text-4xl md:text-5xl font-black font-mono text-center tracking-[0.5rem] md:tracking-[1rem] placeholder-zinc-300 dark:placeholder-zinc-800 focus:outline-none focus:border-[#00ff88]/50 transition-all shadow-inner"
              />
            </div>
          </div>

          <button 
            disabled={status === "searching" || code.length < 6}
            className="w-full bg-[#00ff88] disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-500 hover:bg-[#00ff88]/80 text-black font-black py-5 rounded-2xl transition-all shadow-[0_20px_40px_rgba(0,255,136,0.2)]"
          >
            {status === "searching" ? "Authenticating..." : "Synchronize Robot"}
          </button>
        </form>

        {status === "found" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-2xl flex items-start gap-4"
          >
            <CheckCircle2 className="w-6 h-6 text-[#00ff88] flex-shrink-0" />
            <div>
              <h3 className="font-black text-[#00ff88] text-lg">Uplink Established!</h3>
              <p className="text-sm text-[#00ff88]/80 mt-1 font-medium">
                Your Desk Toy is now securely linked to your profile. Its neural network is ready for interaction.
              </p>
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4"
          >
            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-black text-red-500 text-lg">Link Failed</h3>
              <p className="text-sm text-red-500/80 mt-1 font-medium">
                {errorMessage}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <p className="text-center text-zinc-500 text-xs font-bold uppercase tracking-widest mt-10">
        Make sure your hardware is online
      </p>
    </div>
  );
}
