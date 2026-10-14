"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/utils/cn";

export interface KPICardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string | number;
    direction: "up" | "down" | "neutral";
  };
  comparison?: string;
  statusText?: string;
  statusVariant?: "healthy" | "warning" | "alert" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export function KPICard({
  label,
  value,
  trend,
  comparison = "vs last month",
  statusText,
  statusVariant = "healthy",
  icon,
  className,
}: KPICardProps) {
  const statusStyles = {
    healthy: "text-emerald-700 bg-emerald-50 border-emerald-200",
    warning: "text-amber-700 bg-amber-50 border-amber-200",
    alert: "text-rose-700 bg-rose-50 border-rose-200",
    neutral: "text-slate-600 bg-slate-100 border-slate-200",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            {icon}
          </div>
        )}
      </div>

      <div className="my-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center font-semibold gap-0.5",
                trend.direction === "up" && "text-emerald-600",
                trend.direction === "down" && "text-rose-600",
                trend.direction === "neutral" && "text-slate-500"
              )}
            >
              {trend.direction === "up" && <TrendingUp className="w-3.5 h-3.5" />}
              {trend.direction === "down" && <TrendingDown className="w-3.5 h-3.5" />}
              {trend.direction === "neutral" && <Minus className="w-3.5 h-3.5" />}
              {trend.value}
            </span>
          )}
          <span className="text-slate-400">{comparison}</span>
        </div>

        {statusText && (
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-medium border leading-none",
              statusStyles[statusVariant]
            )}
          >
            {statusText}
          </span>
        )}
      </div>
    </div>
  );
}
