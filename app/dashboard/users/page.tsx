"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UsersManager } from "@/components/dashboard/UsersManager";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/utils/apiClient";
import type { AdminUser, Specialization } from "@/types";

interface ToastState { message: string; type: "success" | "error" | "info" }

export default function UsersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace("/"); return; }
    if (user.role === "Master") { router.replace("/dashboard"); return; }

    const isMainAdmin = user.role === "MainAdmin";
    setIsDataLoading(true);
    Promise.all([
      apiClient<AdminUser[]>(
        isMainAdmin ? "/api/admin/users" : "/api/admin/users?role=Master"
      ).catch(() => [] as AdminUser[]),
      apiClient<Specialization[]>("/api/specializations").catch(() => [] as Specialization[]),
    ]).then(([u, sp]) => {
      setUsers(u);
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
      <UsersManager
        users={users}
        specializations={specializations}
        isMainAdmin={user?.role === "MainAdmin"}
        onUsersChange={setUsers}
        onToast={showToast}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
