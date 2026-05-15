"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { Mail, Lock, AlertCircle, CheckCircle2, User, ArrowRight, ShieldCheck, MailSearch } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { 
    user, 
    loginWithGoogle, 
    loginWithEmail, 
    registerWithEmail,
    resetPassword,
    translateError 
  } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isVerifySent, setIsVerifySent] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.emailVerified) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const validateEmail = (email: string) => {
    // Specifically check for gmail if requested, or just standard email
    return email.toLowerCase().endsWith("@gmail.com");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (isRegistering && !validateEmail(email)) {
      setError("Professional accounts require a valid @gmail.com address.");
      setLoading(false);
      return;
    }

    try {
      if (isForgotMode) {
        await resetPassword(email);
        setSuccess("Password reset link sent to your email!");
        setTimeout(() => setIsForgotMode(false), 3000);
      } else if (isRegistering) {
        await registerWithEmail(name, email, password);
        setIsVerifySent(true);
        setSuccess("Verification email sent! Check your inbox.");
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      const friendlyMsg = translateError(err.code || err.message);
      setError(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-white flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00ff88]/5 blur-[100px] rounded-full pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-3 text-zinc-500 hover:text-[#00ff88] transition-colors">
        <Logo size={32} />
        <span className="font-bold tracking-wider uppercase text-xs">Desk Toy</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo size={72} className="drop-shadow-[0_0_20px_rgba(0,255,136,0.4)]" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-2">
            {isForgotMode ? "Reset Brain" : isRegistering ? (isVerifySent ? "Check Inbox" : "Join the Family") : "Welcome Back"}
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            {isForgotMode ? "We'll send you a recovery link" : isVerifySent ? "We sent a link to verify your identity" : "Sign in to manage your AI companion"}
          </p>
        </div>

        <div className="space-y-4">
          {!isForgotMode && !isVerifySent && (
            <>
              <button 
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-black py-4 px-4 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-black/10"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
              
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-zinc-200 dark:border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-zinc-400 text-[10px] font-black uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-zinc-200 dark:border-white/10"></div>
              </div>
            </>
          )}

          {isVerifySent ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-20 h-20 bg-[#00ff88]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-[#00ff88]/20">
                <MailSearch className="w-10 h-10 text-[#00ff88] animate-pulse" />
              </div>
              <p className="text-zinc-500 font-medium mb-8">
                Go to <span className="text-[#00ff88] font-bold">{email}</span> and click the verification link to start your journey.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-[#00ff88] text-black font-black py-4 rounded-2xl shadow-xl"
              >
                I've Verified My Email
              </button>
            </motion.div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-3">
                {isRegistering && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name" 
                      required
                      className="w-full bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff88]/50 transition-all"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Gmail address" 
                    required
                    className="w-full bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff88]/50 transition-all"
                  />
                </div>

                {!isForgotMode && (
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password" 
                      required
                      className="w-full bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff88]/50 transition-all"
                    />
                  </div>
                )}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#00ff88]/10 border border-[#00ff88]/20 p-4 rounded-2xl flex items-center gap-3 text-[#00ff88] text-xs font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#00ff88] hover:bg-[#00ff88]/80 text-black font-black py-4 rounded-2xl transition-all shadow-[0_20px_40px_rgba(0,255,136,0.2)] disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-500 flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    {isForgotMode ? "Send Recovery Link" : isRegistering ? "Get Verification Link" : "Enter Dashboard"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {!isVerifySent && (
            <div className="flex flex-col items-center gap-4 mt-6 text-sm">
              {!isForgotMode && !isRegistering && (
                <button 
                  onClick={() => setIsForgotMode(true)}
                  className="text-zinc-500 hover:text-[#00ff88] font-bold transition-colors"
                >
                  Forgot Password?
                </button>
              )}
              
              <button 
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setIsForgotMode(false);
                  setError("");
                }}
                className="text-zinc-400 font-bold hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                {isForgotMode 
                  ? "Back to Login" 
                  : isRegistering 
                    ? "Already have an account? Sign In" 
                    : "New here? Create Account"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
