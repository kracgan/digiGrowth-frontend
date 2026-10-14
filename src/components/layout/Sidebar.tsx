"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  CalendarCheck,
  BarChart3,
  Lightbulb,
  Settings,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/utils/cn";

export const NAV_ITEMS = [
  {
    label: "Home",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Learn",
    href: "/learn",
    icon: GraduationCap,
  },
  {
    label: "Planner",
    href: "/planner",
    icon: CalendarCheck,
  },
  {
    label: "Business results",
    href: "/business-results",
    icon: BarChart3,
  },
  {
    label: "Recommendations",
    href: "/recommendations",
    icon: Lightbulb,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { organization } = useAuthStore();
  const isOwnerOrAdmin =
    organization?.role === "owner" || organization?.role === "admin";

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 bg-slate-900 border-r border-slate-800 text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-white block leading-none">
            Digital Growth
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Small Business OS
          </span>
        </div>
      </div>

      {/* Active Business Workspace info */}
      {organization && (
        <div className="px-5 py-4 border-b border-slate-800/60 bg-slate-900/60">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Current Workspace
          </div>
          <div className="text-sm font-semibold text-white truncate">
            {organization.name}
          </div>
          <div className="text-xs text-blue-400 flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="truncate">{organization.category}</span>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Main Workspace
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
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform group-hover:scale-105",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Administration / Settings */}
        <div className="pt-6 px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Preferences & Admin
        </div>
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-blue-600 text-white font-semibold"
              : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
          )}
        >
          <Settings className="w-4 h-4 shrink-0 text-slate-400" />
          <span>Business Settings</span>
        </Link>

        {isOwnerOrAdmin && (
          <Link
            href="/admin/users"
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
            )}
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Admin Console</span>
          </Link>
        )}
      </nav>

      {/* Footer hint */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400 bg-slate-950/40">
        <p className="font-medium text-slate-300">Need immediate help?</p>
        <p className="mt-0.5">Learn → Plan → Measure loop active.</p>
      </div>
    </aside>
  );
}
