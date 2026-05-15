"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, query, doc, deleteDoc, updateDoc, where } from "firebase/firestore";
import { Shield, Package, User, Trash2, Power, PowerOff, Users, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPanel() {
  const { user, isAdmin: authIsAdmin } = useAuth();
  const [devices, setDevices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"devices" | "users">("devices");

  const fetchData = async () => {
    setLoading(true);
    try {
      const userSnap = await getDocs(collection(db, "users"));
      const userList = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(userList);

      const userMap = userList.reduce((acc: Record<string, string>, u: any) => {
        acc[u.id] = u.name || u.displayName || "Unidentified User";
        return acc;
      }, {});

      const deviceSnap = await getDocs(collection(db, "devices"));
      const deviceList = deviceSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          ownerName: userMap[data.user_id] || "No Owner Linked"
        };
      });
      setDevices(deviceList);
    } catch (err) {
      console.error("Admin Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && authIsAdmin) {
      fetchData();
    }
  }, [user, authIsAdmin]);

  const deleteDevice = async (id: string) => {
    if (!confirm("Are you sure? This will permanently remove the device.")) return;
    await deleteDoc(doc(db, "devices", id));
    fetchData();
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure? This will delete the user from AUTH, FIRESTORE, and all their DEVICES.")) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://desk-toy.onrender.com";
      const res = await fetch(`${backendUrl}/admin/delete-user/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("User permanently deleted.");
        fetchData();
      } else {
        alert("Failed to delete user from Auth. Check backend logs.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const toggleAI = async (deviceId: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "devices", deviceId), { ai_enabled: !currentStatus });
    fetchData();
  };

  if (!authIsAdmin && !loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center px-6">
        <Shield className="w-16 h-16 text-red-500 mb-4 opacity-20" />
        <h2 className="text-2xl font-black mb-2">Access Denied</h2>
        <p className="text-zinc-500 max-w-md">Admin clearance required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter flex items-center gap-3">
            <Shield className="w-8 h-8 md:w-10 md:h-10 text-[#00ff88]" />
            Control Center
          </h1>
          <p className="text-sm md:text-base text-zinc-500 font-medium">Full Administrative Access Layer</p>
        </div>

        <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-2xl border border-zinc-200 dark:border-white/10 self-start lg:self-center">
          <button 
            onClick={() => setActiveTab("devices")}
            className={`px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === "devices" ? "bg-[#00ff88] text-black shadow-lg" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
          >
            Devices ({devices.length})
          </button>
          <button 
            onClick={() => setActiveTab("users")}
            className={`px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === "users" ? "bg-[#00ff88] text-black shadow-lg" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
          >
            Users ({users.length})
          </button>
        </div>
      </div>

      {loading ? (
         <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#00ff88]" />
         </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-xl"
          >
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-zinc-50 dark:bg-white/5 text-[10px] uppercase font-black tracking-widest text-zinc-500">
                  <tr>
                    {activeTab === "devices" ? (
                      <>
                        <th className="px-6 md:px-8 py-5">MAC ID</th>
                        <th className="px-6 md:px-8 py-5">Owner</th>
                        <th className="px-6 md:px-8 py-5">AI Support</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 md:px-8 py-5">Identity</th>
                        <th className="px-6 md:px-8 py-5">Role</th>
                        <th className="px-6 md:px-8 py-5">Status</th>
                      </>
                    )}
                    <th className="px-6 md:px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                  {activeTab === "devices" ? (
                    devices.map(dev => (
                      <tr key={dev.id} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 md:px-8 py-5 font-mono text-[#00ff88] text-sm">{dev.id}</td>
                        <td className="px-6 md:px-8 py-5 font-black text-zinc-950 dark:text-zinc-200">{dev.ownerName}</td>
                        <td className="px-6 md:px-8 py-5">
                          <button 
                            onClick={() => toggleAI(dev.id, dev.ai_enabled !== false)}
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black border transition-all ${
                              dev.ai_enabled !== false 
                              ? "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20" 
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}
                          >
                            {dev.ai_enabled !== false ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                            {dev.ai_enabled !== false ? "ACTIVE" : "PAUSED"}
                          </button>
                        </td>
                        <td className="px-6 md:px-8 py-5 text-right">
                          <button 
                            onClick={() => deleteDevice(dev.id)}
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    users.map(u => (
                      <tr key={u.id} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 md:px-8 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-[#00ff88]/10 rounded-xl flex items-center justify-center border border-[#00ff88]/20">
                                <User className="w-5 h-5 text-[#00ff88]" />
                             </div>
                             <div>
                                <p className="font-bold">{u.name}</p>
                                <p className="text-xs text-zinc-500">{u.email}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-5">
                          <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${u.role === 'admin' ? 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20' : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 border-zinc-200 dark:border-white/10'}`}>
                             {u.role?.toUpperCase() || 'USER'}
                          </span>
                        </td>
                        <td className="px-6 md:px-8 py-5">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                             <span className="text-[10px] font-bold text-zinc-500">Live</span>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-5 text-right">
                          <button 
                            onClick={() => deleteUser(u.id)}
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
