"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { Loader2 } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setAuth, clearAuth } = useAuthStore();
  const [checking, setChecking] = useState(!user);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const res = await authService.getMe();
        if (mounted && res && res.user && res.organization) {
          setAuth(res.user, res.organization);
        }
      } catch (err) {
        if (mounted) {
          clearAuth();
          router.push("/login");
        }
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    };

    if (!user) {
      checkSession();
    } else {
      setChecking(false);
    }

    return () => {
      mounted = false;
    };
  }, [user, setAuth, clearAuth, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Loading workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
