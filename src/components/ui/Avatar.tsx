"use client";

import React from "react";
import { cn } from "@/utils/cn";

export interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={cn(
        "rounded-full bg-blue-600 font-semibold text-white flex items-center justify-center select-none ring-2 ring-white shadow-xs",
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
