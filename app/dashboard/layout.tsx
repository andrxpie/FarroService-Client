"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, ClipboardList, Users, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

function TabLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const active = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
        active ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

export default function DashboardRouteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user.role === "Admin" || user.role === "MainAdmin";
  const isMainAdmin = user.role === "MainAdmin";
  const isMaster = user.role === "Master";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <DashboardLayout
        title={isAdmin ? "Панель адміністратора" : "Панель майстра"}
        role={isMainAdmin ? "Головний адміністратор" : isAdmin ? "Адміністратор" : "Майстер"}
      >
        <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
          {isAdmin && (
            <>
              <TabLink href="/dashboard/bookings" icon={<ClipboardList className="w-4 h-4" />} label="Записи" />
              <TabLink href="/dashboard/services" icon={<Settings className="w-4 h-4" />} label="Послуги" />
              <TabLink href="/dashboard/users" icon={<Users className="w-4 h-4" />} label="Користувачі" />
            </>
          )}
          {isMaster && (
            <>
              <TabLink href="/dashboard/bookings" icon={<ClipboardList className="w-4 h-4" />} label="Мої записи" />
              <TabLink href="/dashboard/schedule" icon={<CalendarDays className="w-4 h-4" />} label="Мій розклад" />
            </>
          )}
        </div>
        {children}
      </DashboardLayout>
    </main>
  );
}
