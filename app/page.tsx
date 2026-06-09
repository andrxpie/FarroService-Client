"use client";

import React, { useState } from "react";
import {
  Phone,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  MapPin,
  Briefcase,
} from "lucide-react";
import {
  ViewState,
  Service,
  Booking,
  BookingStatus,
  ToastNotification,
} from "@/types";
import { SERVICES, INITIAL_BOOKINGS } from "@/lib/data";
import { Navbar } from "@/components/layout/Navbar";
import { ServiceCard } from "@/components/guest/ServiceCard";
import { BookingWizard } from "@/components/guest/BookingWizard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BookingsTable } from "@/components/dashboard/BookingsTable";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function Home() {
  const [view, setView] = useState<ViewState>("guest");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // --- Actions ---

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setView("guest-booking");
  };

  const handleBookingComplete = (newBookingData: Partial<Booking>) => {
    const newBooking: Booking = {
      id: bookings.length + 1,
      serviceId: newBookingData.serviceId!,
      masterId: newBookingData.masterId!,
      date: newBookingData.date!,
      time: newBookingData.time!,
      client: newBookingData.client!,
      phone: newBookingData.phone,
      address: newBookingData.address,
      status: "pending",
    };

    setBookings((prev) => [...prev, newBooking]);
    setView("guest");
    showToast(
      "Ваш запит успішно надіслано! Очікуйте підтвердження.",
      "success"
    );
  };

  const handleStatusChange = (id: number, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    showToast(`Статус замовлення #${id} змінено на ${newStatus}`, "info");
  };

  const showToast = (message: string, type: ToastNotification["type"]) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Render Content ---

  const renderContent = () => {
    switch (view) {
      case "guest":
        return (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Сантехніка та Монтаж{" "}
                <span className="text-blue-600">Farro</span>
              </h1>
              <p className="text-lg text-slate-600">
                Професійні послуги майстрів. Обирайте послугу, бронюйте зручний
                час, а ми подбаємо про якість.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SERVICES.map((s) => (
                <ServiceCard
                  key={s.id}
                  service={s}
                  onSelect={handleBookService}
                />
              ))}
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">
                  Не знайшли потрібну послугу?
                </h2>
                <p className="text-slate-400">
                  Зателефонуйте нам для індивідуального прорахунку
                </p>
              </div>
              <button className="mt-6 md:mt-0 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors z-10 flex items-center gap-2">
                <Phone className="w-5 h-5" /> +380 44 123 4567
              </button>
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
            </div>
          </div>
        );

      case "guest-booking":
        if (!selectedService) return null;
        return (
          <BookingWizard
            service={selectedService}
            bookings={bookings}
            onBack={() => setView("guest")}
            onComplete={handleBookingComplete}
          />
        );

      case "master":
        const myBookings = bookings
          .filter((b) => b.masterId === 101)
          .sort((a, b) => a.date.localeCompare(b.date));
        return (
          <DashboardLayout title="Мій Розклад" role="Майстер (О. Петренко)">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" /> Найближчі
                  завдання
                </h3>
                {myBookings.length === 0 ? (
                  <p className="text-slate-500 italic">
                    На сьогодні завдань немає
                  </p>
                ) : (
                  myBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4"
                    >
                      <div className="bg-slate-50 p-3 rounded-lg text-center min-w-20">
                        <div className="font-bold text-slate-900 text-lg">
                          {b.time}
                        </div>
                        <div className="text-xs text-slate-500">{b.date}</div>
                      </div>
                      <div className="grow">
                        <h4 className="font-bold text-slate-900">
                          {SERVICES.find((s) => s.id === b.serviceId)?.title}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                          <User className="w-3 h-3" /> {b.client}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{" "}
                          {b.address || "Адреса не вказана"}
                        </p>
                      </div>
                      <Badge status={b.status} />
                    </div>
                  ))
                )}
              </div>
              <div>
                <Card className="p-6 sticky top-24">
                  <h3 className="font-bold text-slate-900 mb-4">Статистика</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Виконано за місяць</span>
                      <span className="font-bold text-slate-900">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Рейтинг</span>
                      <span className="font-bold text-yellow-600 flex items-center gap-1">
                        ★ 4.9
                      </span>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <button className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-200">
                        Повідомити про проблему
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </DashboardLayout>
        );

      case "admin":
        const adminBookings = [...bookings].sort((a) =>
          a.status === "pending" ? -1 : 1
        );
        return (
          <DashboardLayout title="Панель Адміністратора" role="Головний Адмін">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-5 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {bookings.length}
                  </div>
                  <div className="text-xs text-slate-500 font-medium uppercase">
                    Всього заявок
                  </div>
                </div>
              </Card>
              <Card className="p-5 flex items-center gap-4">
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {bookings.filter((b) => b.status === "pending").length}
                  </div>
                  <div className="text-xs text-slate-500 font-medium uppercase">
                    Очікують
                  </div>
                </div>
              </Card>
            </div>

            <h3 className="font-bold text-lg text-slate-800 mb-4">
              Журнал бронювань
            </h3>
            <BookingsTable
              bookings={adminBookings}
              onAction={handleStatusChange}
            />
          </DashboardLayout>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <Navbar currentView={view} onViewChange={setView} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <Clock className="w-5 h-5 text-blue-400" />
          )}
          <p className="font-medium">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
