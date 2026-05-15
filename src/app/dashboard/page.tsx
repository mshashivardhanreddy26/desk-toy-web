"use client";

import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Cpu, Activity, Battery, Wifi, Plus, Bot, Sparkles, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function DashboardOverview() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Real-time listener for user's devices
    const q = query(collection(db, "devices"), where("user_id", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const deviceList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDevices(deviceList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-4xl font-black tracking-tighter">Welcome, {user?.displayName?.split(" ")[0] || "Human"}!</h1>
        <p className="text-sm md:text-base text-zinc-500 font-medium">Monitoring your hardware ecosystem.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[
          { label: "Active Toys", value: devices.length.toString(), icon: Cpu, color: "text-blue-400" },
          { label: "Brain Link", value: "Active", icon: Activity, color: "text-[#00ff88]" },
          { label: "Signal", value: devices.length > 0 ? "Strong" : "--", icon: Wifi, color: "text-zinc-500" },
          { label: "Battery", value: devices.length > 0 ? "85%" : "--", icon: Battery, color: "text-zinc-500" },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm font-medium">{stat.label}</span>
              <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
            </div>
            <p className="text-xl md:text-2xl font-black">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Active Device Section */}
      <section className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] relative overflow-hidden shadow-sm">
        {/* Glow effect inside the card */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#00ff88]/5 blur-[60px] rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-zinc-950 dark:text-white">Your Robots</h2>
          {devices.length > 0 && (
            <Link href="/dashboard/pair" className="text-[#00ff88] text-xs font-black flex items-center gap-1.5 hover:opacity-80 transition-all uppercase tracking-widest">
              <Plus className="w-4 h-4" /> Add New
            </Link>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-24 flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-10 h-10 animate-spin text-[#00ff88]" />
             <p className="text-zinc-500 font-medium">Scanning for hardware links...</p>
          </div>
        ) : devices.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-4"
          >
            <div className="relative w-28 h-28 mx-auto mb-8">
              <div className="absolute inset-0 bg-[#00ff88]/20 blur-[30px] rounded-full animate-pulse" />
              <div className="relative w-full h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-full flex items-center justify-center shadow-2xl">
                <Bot className="w-12 h-12 text-[#00ff88]" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-bounce" />
            </div>
            
            <h3 className="text-3xl font-black mb-4 tracking-tighter">Welcome to the Desk Toy Family! ✨</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Your journey to a smarter desk starts here. Link your first physical 
              robot to unlock its unique personality and emotional brain.
            </p>
            
            <Link 
              href="/dashboard/pair"
              className="inline-flex items-center gap-3 bg-[#00ff88] hover:bg-[#00ff88]/80 text-black font-black px-10 py-5 rounded-[2rem] transition-all shadow-[0_20px_40px_rgba(0,255,136,0.2)] hover:scale-105 active:scale-95"
            >
              <Plus className="w-6 h-6" />
              Pair Your First Robot
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {devices.map((device) => (
              <div key={device.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-8 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl md:rounded-3xl group hover:border-[#00ff88]/30 transition-all shadow-sm">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="w-12 h-12 bg-[#00ff88]/10 rounded-xl flex items-center justify-center border border-[#00ff88]/20 group-hover:bg-[#00ff88]/20 transition-colors">
                    <Cpu className="w-6 h-6 text-[#00ff88]" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl tracking-tight">{device.id}</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Serial: {device.id}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 border-zinc-100 dark:border-white/5 pt-4 sm:pt-0">
                  <div className="text-left">
                    <p className="text-[10px] text-zinc-500 uppercase font-black mb-0.5">Link Status</p>
                    <p className="text-sm font-bold text-[#00ff88]">Synchronized</p>
                  </div>
                  <Link 
                    href={`/dashboard/product/${device.id}`}
                    className="bg-zinc-900 dark:bg-white/10 hover:bg-zinc-800 dark:hover:bg-white/20 text-white px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-black/10 flex items-center gap-2"
                  >
                    Control Room
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
