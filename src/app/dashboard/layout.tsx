"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { LayoutDashboard, MessageSquare, Settings, LogOut, PlusCircle, Shield, Sun, Moon, MailWarning, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { sendEmailVerification } from "firebase/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin, refreshUser } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center">
        <Logo size={48} className="animate-pulse drop-shadow-[0_0_20px_rgba(0,255,136,0.5)]" />
      </div>
    );
  }

  const currentTheme = resolvedTheme || theme;

  // Verification Guard
  if (user && !user.emailVerified && !user.providerData.some(p => p.providerId === 'google.com')) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505] flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00ff88]/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-md w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 p-10 rounded-[3rem] shadow-2xl backdrop-blur-xl">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-yellow-500/20">
            <MailWarning className="w-10 h-10 text-yellow-500" />
          </div>
          
          <h1 className="text-3xl font-black tracking-tighter mb-4">Verification Pending</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8 leading-relaxed">
            We've sent a secure link to <span className="text-[#00ff88] font-bold">{user.email}</span>. 
            Please verify your email to unlock your Desk Toy dashboard.
          </p>

          <div className="space-y-4">
            <button 
              disabled={verifying}
              onClick={async () => {
                setVerifying(true);
                await refreshUser();
                setVerifying(false);
              }}
              className="w-full bg-[#00ff88] hover:bg-[#00ff88]/80 text-black font-black py-4 rounded-2xl transition-all shadow-[0_20px_40px_rgba(0,255,136,0.2)] flex items-center justify-center gap-2"
            >
              {verifying ? <RefreshCw className="w-5 h-5 animate-spin" /> : "I've Verified My Email"}
            </button>
            
            <button 
              onClick={async () => {
                setResending(true);
                try {
                  await sendEmailVerification(user);
                  alert("New verification link sent!");
                } catch(e) { alert("Please wait a moment before resending."); }
                setResending(false);
              }}
              disabled={resending}
              className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-white font-bold transition-colors"
            >
              {resending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Resend Link
            </button>

            <button onClick={logout} className="text-zinc-400 text-sm hover:text-red-400 mt-4 underline underline-offset-4">
              Sign out and use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Link Hardware", href: "/dashboard/pair", icon: PlusCircle },
    { name: "Account", href: "/dashboard/settings", icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ name: "Control Center", href: "/dashboard/admin", icon: Shield });
  }

  return (
    <div className="h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-white flex flex-col md:flex-row overflow-hidden transition-colors duration-300">
      
      {/* Sidebar - Desktop Only */}
      <aside className="w-64 border-r border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-[#0A0A0A] p-6 hidden md:flex flex-col backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-10">
          <Logo size={32} />
          <span className="font-bold tracking-widest text-lg">DESK TOY</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive 
                    ? "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20" 
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className={`text-sm font-bold ${isActive ? "text-[#00ff88]" : "text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950"}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-zinc-200 dark:border-white/10 mt-auto space-y-4">
          <button
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl transition-all"
          >
            {mounted ? (
              <>
                {currentTheme === "dark" ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-500" />
                )}
                <span className="dark:text-zinc-400 text-zinc-900 uppercase tracking-widest text-[9px]">Mode: {currentTheme === "dark" ? "Light" : "Dark"}</span>
              </>
            ) : (
              <div className="w-5 h-5 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            )}
          </button>

          <div className="flex items-center gap-3 px-4 py-2 bg-zinc-100 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/10">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=00ff88&color=000`} alt="Avatar" className="w-9 h-9 rounded-xl shadow-sm" />
            <div className="overflow-hidden">
              <p className="text-xs font-black text-zinc-950 dark:text-white truncate">{user.displayName || "User"}</p>
              <p className="text-[10px] text-zinc-500 truncate font-medium">{user.email}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-2 text-xs font-bold text-zinc-400 hover:text-red-500 transition-all">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-t border-zinc-200 dark:border-white/10 flex items-center justify-around px-4 z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className={`p-2.5 rounded-2xl transition-all ${isActive ? "text-[#00ff88] bg-[#00ff88]/10" : "text-zinc-500 hover:text-zinc-950"}`}>
              <Icon className="w-6 h-6" />
            </Link>
          );
        })}
        <button 
          onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")} 
          className="p-2.5 text-zinc-500 hover:text-zinc-950 transition-colors"
        >
          {currentTheme === "dark" ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
        <button onClick={logout} className="p-2.5 text-zinc-400 hover:text-red-500 transition-colors">
          <LogOut className="w-6 h-6" />
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10 relative">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
