"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BookingsTable } from "@/components/dashboard/BookingsTable";
import { EditBookingModal } from "@/components/dashboard/EditBookingModal";
import { Toast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Booking | null>(null);

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

  const doDelete = useCallback(async (id: string) => {
    try {
      await apiClient(`/api/bookings/${id}`, { method: "DELETE" });
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setToast({ message: "Не вдалося видалити бронювання.", type: "error" });
    }
  }, []);

  if (isDataLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.role === "Admin" || user?.role === "MainAdmin";

  return (
    <>
      <BookingsTable
        bookings={bookings}
        onAction={handleAction}
        onDelete={isAdmin ? setDeleteId : undefined}
        onEdit={isAdmin ? setEditing : undefined}
        showId={user?.role !== "Master"}
      />
      <EditBookingModal
        booking={editing}
        onClose={() => setEditing(null)}
        onSaved={(updated) => setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))}
        onToast={(message, type) => setToast({ message, type })}
      />
      <ConfirmModal
        isOpen={!!deleteId}
        message="Видалити це бронювання? Дію неможливо скасувати."
        onConfirm={() => { doDelete(deleteId!); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
