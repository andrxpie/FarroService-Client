"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ServiceCard } from "@/components/guest/ServiceCard";
import { BookingWizard } from "@/components/guest/BookingWizard";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/utils/apiClient";
import type { Service, Booking, CreateBookingPayload } from "@/types";

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/dashboard");
      return;
    }
    if (isAuthLoading) return;

    setIsDataLoading(true);
    apiClient<Service[]>("/api/services")
      .then((s) => setServices(s ?? []))
      .catch(() => setServices([]))
      .finally(() => setIsDataLoading(false));
  }, [user, isAuthLoading, router]);

  const showToast = useCallback((message: string, type: ToastState["type"]) => {
    setToast({ message, type });
  }, []);

  const handleBookingComplete = async (data: CreateBookingPayload) => {
    try {
      await apiClient<Booking>("/api/bookings/book", {
        method: "POST",
        body: JSON.stringify({
          clientName: data.clientName,
          phone: data.phone,
          serviceId: data.serviceId,
          masterId: data.masterId,
          date: data.date,
          startTime: data.startTime,
          address: data.address,
          comment: data.comment ?? null,
        }),
      });
      showToast("Запис успішно створено!", "success");
    } catch {
      showToast("Сталася помилка при збереженні запису.", "error");
    } finally {
      setSelectedService(null);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isDataLoading && (
        <div className="text-xs text-blue-600 animate-pulse mb-4 flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-600 rounded-full inline-block" /> Синхронізація з FarroService API...
        </div>
      )}

      {selectedService ? (
        <BookingWizard
          service={selectedService}
          onBack={() => setSelectedService(null)}
          onComplete={handleBookingComplete}
        />
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Послуги</h1>
            <p className="text-slate-500 mt-2">Оберіть послугу для бронювання майстра</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} onSelect={setSelectedService} />
            ))}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  );
}
