"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut 
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  userData: any;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  translateError: (code: string) => string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Helper to ensure user doc exists in Firestore
  const syncUserToFirestore = async (currentUser: User, displayName?: string) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const initialData = {
          name: displayName || currentUser.displayName || "New Human",
          email: currentUser.email,
          createdAt: serverTimestamp(),
          voice: "en-US-AndrewNeural",
          system_prompt: "You are 'Desk Toy', a cute emotional desk robot.",
          role: "user"
        };
        await setDoc(userRef, initialData);
        setUserData(initialData);
      } else {
        setUserData(userSnap.data());
      }
    } catch (err) {
      console.error("Firestore Sync Error:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserToFirestore(currentUser);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await syncUserToFirestore(result.user);
      }
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      await updateProfile(result.user, { displayName: name });
      await sendEmailVerification(result.user);
      await syncUserToFirestore(result.user, name);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({...auth.currentUser});
      await syncUserToFirestore(auth.currentUser);
    }
  };

  const translateError = (code: string) => {
    console.log("Firebase Error Code:", code); // Useful for debugging
    switch (code) {
      case "auth/invalid-credential": return "Oops! Email or Password doesn't match our records.";
      case "auth/email-already-in-use": return "This email is already part of the family. Try logging in!";
      case "auth/invalid-email": return "That doesn't look like a real email. Check it again?";
      case "auth/weak-password": return "Your password is a bit too shy. Make it at least 6 characters!";
      case "auth/user-not-found": return "We couldn't find an account with that email.";
      case "auth/wrong-password": return "Oops! That password doesn't match our records.";
      case "auth/network-request-failed": return "Internet connection looks a bit weak. Check your signal!";
      case "auth/too-many-requests": return "Too many tries! Take a 1-minute break and try again.";
      default: return `Something went wrong (${code}). Let's try that again!`;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData,
      isAdmin: userData?.role === "admin",
      loading, 
      loginWithGoogle, 
      loginWithEmail, 
      registerWithEmail,
      resetPassword,
      logout,
      refreshUser,
      translateError
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
