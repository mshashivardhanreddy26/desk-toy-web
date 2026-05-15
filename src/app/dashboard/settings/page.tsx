"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Shield, Smartphone, Globe, Palette } from "lucide-react";
import { useTheme } from "next-themes";

export default function AccountSettings() {
  const { user, userData, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">Account Control</h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">Manage your personal profile and security preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <section className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-8 rounded-[2.5rem] shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#00ff88]/10 rounded-xl flex items-center justify-center border border-[#00ff88]/20">
              <User className="w-5 h-5 text-[#00ff88]" />
            </div>
            <h2 className="text-xl font-black tracking-tight">Identity</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Full Name</label>
              <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-inner">
                <span className="font-bold text-zinc-950 dark:text-zinc-200">{user?.displayName || "New User"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Email Address</label>
              <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-inner">
                <Mail className="w-4 h-4 text-zinc-400" />
                <span className="font-bold text-zinc-950 dark:text-zinc-200">{user?.email}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences Card */}
        <section className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-8 rounded-[2.5rem] shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Palette className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-black tracking-tight">App Experience</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Global Theme</label>
              <div className="flex p-1 bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-2xl">
                <button 
                  onClick={() => setTheme("light")}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${theme === 'light' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-black'}`}
                >
                  Light
                </button>
                <button 
                  onClick={() => setTheme("dark")}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${theme === 'dark' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                >
                  Dark
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Account Status</label>
              <div className="flex items-center gap-2 p-4 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-2xl">
                <Shield className="w-4 h-4 text-[#00ff88]" />
                <span className="text-xs font-bold text-[#00ff88] uppercase tracking-tighter">Verified Member</span>
              </div>
            </div>
          </div>
        </section>

        {/* Security / Danger Zone */}
        <section className="md:col-span-2 bg-red-500/5 border border-red-500/10 p-8 rounded-[2.5rem]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-black text-red-500">Danger Zone</h3>
              <p className="text-sm text-red-500/60 font-medium">Once you sign out, you will need to verify your credentials to re-enter the dashboard.</p>
            </div>
            <button 
              onClick={logout}
              className="px-10 py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-500/20 active:scale-95"
            >
              Sign Out Securely
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
