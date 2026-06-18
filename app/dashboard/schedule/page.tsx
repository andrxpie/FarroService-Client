"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ScheduleEditor } from "@/components/dashboard/ScheduleEditor";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";

interface ToastState { message: string; type: "success" | "error" | "info" }

export default function SchedulePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) { router.replace("/"); return null; }
  if (user.role !== "Master") { router.replace("/dashboard"); return null; }

  return (
    <>
      <ScheduleEditor masterId={user.id} onToast={showToast} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
