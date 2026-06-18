"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ServicesManager } from "@/components/dashboard/ServicesManager";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/utils/apiClient";
import type { Service, Specialization } from "@/types";

interface ToastState { message: string; type: "success" | "error" | "info" }

export default function ServicesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace("/"); return; }
    if (user.role === "Master") { router.replace("/dashboard"); return; }

    setIsDataLoading(true);
    Promise.all([
      apiClient<Service[]>("/api/services?includeAll=true").catch(() => [] as Service[]),
      apiClient<Specialization[]>("/api/specializations").catch(() => [] as Specialization[]),
    ]).then(([s, sp]) => {
      setServices(s);
      setSpecializations(sp);
    }).finally(() => setIsDataLoading(false));
  }, [user, isLoading, router]);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  if (isDataLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <ServicesManager
        services={services}
        specializations={specializations}
        onServicesChange={setServices}
        onToast={showToast}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
