"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Menu, X, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { NAV_ITEMS } from "./Sidebar";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, organization, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Mobile Menu Button + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="brand" size="sm" className="gap-1 font-semibold">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Operating Loop</span>
            </Badge>
            <span className="text-xs text-slate-500 font-medium">
              Learn → Plan → Execute → Measure → Improve
            </span>
          </div>
        </div>

        {/* Right Side: User profile info + Logout */}
        <div className="flex items-center gap-4">
          {organization && (
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600">
              <span className="text-slate-400">Target Channel:</span>
              <span className="font-semibold text-slate-800">
                {organization.primaryChannel || "Instagram"}
              </span>
            </div>
          )}

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <Avatar name={user.name} size="sm" />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500">{user.email}</div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign out of account"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile drawer navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-white border-b border-slate-200 shadow-xl p-4 space-y-2 z-40">
          <div className="px-3 py-2 bg-slate-50 rounded-lg mb-3">
            <div className="text-xs font-bold text-slate-900">{organization?.name}</div>
            <div className="text-[11px] text-slate-500">{organization?.category}</div>
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium",
                  isActive
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
