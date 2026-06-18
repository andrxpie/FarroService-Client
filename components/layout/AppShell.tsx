"use client";

import React from "react";
import { Navbar } from "./Navbar";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      {children}
    </div>
  );
}
