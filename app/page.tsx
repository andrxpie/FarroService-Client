"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ServiceCard } from "@/components/guest/ServiceCard";
import { BookingWizard } from "@/components/guest/BookingWizard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BookingsTable } from "@/components/dashboard/BookingsTable";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/utils/apiClient";

import { Service, Booking, BookingStatus, CreateBookingPayload } from "@/types";
import { X, AlertCircle } from "lucide-react";

export default function HomePage() {
  const { user, isLoading: isAuthLoading, login } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    async function loadData() {
      setIsDataLoading(true);
      try {
        const apiServices = await apiClient<Service[]>("/api/services");
        if (apiServices && apiServices.length > 0) {
          setServices(apiServices);
        }
      } catch {
        console.warn("Бекенд недоступний. Активовано Demo-режим.");
      }

      if (user?.role === "Admin" || user?.role === "Master") {
        const bookingsEndpoint = user.role === "Admin" ? "/api/bookings" : "/api/bookings/my";
        try {
          const apiBookings = await apiClient<Booking[]>(bookingsEndpoint);
          if (apiBookings) {
            setBookings(apiBookings);
          }
        } catch (err) {
          console.warn("Не вдалося завантажити записи:", err);
        }
      }

      setIsDataLoading(false);
    }

    if (!isAuthLoading) {
      loadData();
    }
  }, [user, isAuthLoading]);

  const handleLoginSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setAuthError("");
    try {
      await login({ email, password });
      setShowLoginModal(false);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Невірний email або пароль.");
    }
  };

  const handleBookingComplete = async (data: CreateBookingPayload) => {
    try {
      const newBooking = await apiClient<Booking>("/api/bookings/book", {
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

      if (newBooking) {
        setBookings((prev) => [...prev, newBooking]);
        alert("Запис успішно створено!");
      }
    } catch (err) {
      console.error("Помилка відправки запису на сервер:", err);
      alert("Сталася помилка при збереженні запису.");
    } finally {
      setSelectedService(null);
    }
  };

  const handleAdminAction = async (id: string, status: BookingStatus) => {
    try {
      await apiClient(`/api/bookings/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.error("Не вдалося оновити статус на сервері:", err);
    } finally {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
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
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar onLoginClick={() => setShowLoginModal(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isDataLoading && (
          <div className="text-xs text-blue-600 animate-pulse mb-4 flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-600 rounded-full inline-block" /> Синхронізація з FarroService API...
          </div>
        )}

        {user?.role === "Admin" && (
          <DashboardLayout title="Всі записи" role="Адміністратор">
            <BookingsTable bookings={bookings} onAction={handleAdminAction} />
          </DashboardLayout>
        )}

        {user?.role === "Master" && (
          <DashboardLayout title="Мій розклад" role="Майстер">
            <BookingsTable bookings={bookings} onAction={handleAdminAction} />
          </DashboardLayout>
        )}

        {(!user || user.role === "Guest") && (
          <>
            {selectedService ? (
              <BookingWizard service={selectedService} onBack={() => setSelectedService(null)} onComplete={handleBookingComplete} />
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
          </>
        )}
      </main>

      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold mb-1">Авторизація</h2>
              <p className="text-slate-400 text-sm">Вхід до системи для співробітників</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="p-6 space-y-5">
              {authError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {authError}
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  id="login-email"
                  required
                  type="email"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-slate-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@farro.ua"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1">
                  Пароль
                </label>
                <input
                  id="login-password"
                  required
                  type="password"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center cursor-pointer"
                >
                  Увійти до панелі
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
