"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BookingsTable } from "@/components/dashboard/BookingsTable";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/utils/apiClient";
import type { Booking, BookingStatus } from "@/types";

interface ToastState { message: string; type: "success" | "error" | "info" }

export default function BookingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace("/"); return; }

    const url = user.role === "Master" ? "/api/bookings/my" : "/api/bookings";
    setIsDataLoading(true);
    apiClient<Booking[]>(url)
      .then((data) => setBookings(data ?? []))
      .catch(() => setBookings([]))
      .finally(() => setIsDataLoading(false));
  }, [user, isLoading, router]);

  const handleAction = useCallback(async (id: string, status: BookingStatus) => {
    try {
      await apiClient(`/api/bookings/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    } catch {
      setToast({ message: "Не вдалося оновити статус.", type: "error" });
    }
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
      <BookingsTable bookings={bookings} onAction={handleAction} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
