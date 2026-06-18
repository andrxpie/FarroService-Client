"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from "lucide-react";
import { Service, Master, CreateBookingPayload } from "@/types";
import { apiClient } from "@/utils/apiClient";

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

interface BookingWizardProps {
  service: Service;
  onBack: () => void;
  onComplete: (data: CreateBookingPayload) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({ service, onBack, onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState<string>("");
  const [masterId, setMasterId] = useState<string | null>(null);

  const [masters, setMasters] = useState<Master[]>([]);
  const [mastersLoading, setMastersLoading] = useState(true);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    apiClient<Master[]>("/api/masters")
      .then(setMasters)
      .catch(() => setMasters([]))
      .finally(() => setMastersLoading(false));
  }, []);

  useEffect(() => {
    if (masterId === null || !date) return;

    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;

      setSlotsLoading(true);
      setTime("");

      try {
        const data = await apiClient<TimeSlot[]>(`/api/schedule/slots?masterId=${masterId}&serviceId=${service.id}&date=${date}`);
        if (!cancelled) setSlots(data.filter((s) => s.isAvailable));
      } catch {
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [masterId, date, service.id]);

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (masterId === null || !time) return;
    onComplete({
      serviceId: service.id,
      masterId,
      date,
      startTime: time,
      clientName: formData.name,
      phone: formData.phone,
      address: formData.address,
    });
  };

  const selectedMaster = masters.find((m) => m.id === masterId);

  const renderSlots = () => {
    if (masterId === null) {
      return (
        <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-sm text-center border border-dashed border-slate-300">
          Спочатку оберіть майстра
        </div>
      );
    }
    if (slotsLoading) {
      return (
        <div className="flex items-center gap-2 text-slate-400 text-sm p-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Завантаження слотів...
        </div>
      );
    }
    if (slots.length === 0) {
      return (
        <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-sm text-center border border-dashed border-slate-300">
          Немає доступних слотів на цю дату
        </div>
      );
    }
    return (
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.time}
            type="button"
            onClick={() => setTime(slot.time)}
            className={`py-2 px-1 text-sm rounded-lg font-medium transition-all text-center cursor-pointer ${
              time === slot.time
                ? "bg-blue-600 text-white border border-blue-600 shadow-md"
                : "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
            }`}
          >
            {slot.time.slice(0, 5)}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="text-slate-500 hover:text-slate-900 flex items-center mb-6 text-sm font-medium cursor-pointer">
        <ChevronLeft className="w-4 h-4 mr-1" /> Повернутися до послуг
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 text-white p-6">
          <h2 className="text-2xl font-bold mb-1">Оформлення запису</h2>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            <span className="bg-slate-800 px-2 py-0.5 rounded text-white">{service.title}</span>
            <span>•</span>
            <span>{service.durationMinutes} хв</span>
            <span>•</span>
            <span>{service.price === 0 ? "Безкоштовно" : `${service.price} ₴`}</span>
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-8 text-sm">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-blue-600 font-bold" : "text-slate-400"}`}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 1 ? "bg-blue-100 border-blue-600" : "border-slate-300"}`}
              >
                1
              </div>
              Майстер і Час
            </div>
            <div className="h-px bg-slate-200 grow mx-4" />
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-blue-600 font-bold" : "text-slate-400"}`}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 2 ? "bg-blue-100 border-blue-600" : "border-slate-300"}`}
              >
                2
              </div>
              Деталі
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Оберіть майстра</p>
                {mastersLoading ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm p-4">
                    <Loader2 className="w-4 h-4 animate-spin" /> Завантаження майстрів...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {masters.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMasterId(m.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 text-left w-full ${
                          masterId === m.id ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 hover:border-blue-300 bg-white"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                          {m.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-slate-900">{m.fullName}</div>
                          <div className="text-xs text-slate-500">{m.specialization ?? "Майстер"}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="booking-date" className="block text-sm font-medium text-slate-700 mb-2">
                  Оберіть дату
                </label>
                <input
                  id="booking-date"
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-slate-900 bg-white"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Доступні слоти</p>
                {renderSlots()}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!time || masterId === null}
                  onClick={() => setStep(2)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  Далі <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-4 text-sm text-blue-900">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div className="flex flex-col">
                  <span className="font-bold">
                    {date}, о {time.slice(0, 5)}
                  </span>
                  <span className="opacity-80">Майстер: {selectedMaster?.fullName}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="client-name" className="block text-sm font-medium text-slate-700 mb-1">
                    Ваше Ім&apos;я
                  </label>
                  <input
                    id="client-name"
                    required
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-white"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Іван Іванов"
                  />
                </div>
                <div>
                  <label htmlFor="client-phone" className="block text-sm font-medium text-slate-700 mb-1">
                    Телефон
                  </label>
                  <input
                    id="client-phone"
                    required
                    type="tel"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-white"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+380 50 123 4567"
                  />
                </div>
                <div>
                  <label htmlFor="client-address" className="block text-sm font-medium text-slate-700 mb-1">
                    Адреса об&apos;єкта
                  </label>
                  <input
                    id="client-address"
                    required
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-white"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="м. Київ, вул. Хрещатик 1, кв 10"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="text-slate-600 font-medium hover:text-slate-900 cursor-pointer">
                  Назад
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 cursor-pointer"
                >
                  Підтвердити запис
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
