"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar, Loader2, MapPin } from "lucide-react";
import { Service, Master, CreateBookingPayload } from "@/types";
import { apiClient } from "@/utils/apiClient";

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

interface AddressSuggestion {
  place_id: string;
  display_name: string;
  lat: number;
  lng: number;
}

interface BookingWizardProps {
  service: Service;
  onBack: () => void;
  onComplete: (data: CreateBookingPayload) => void;
}

const NAME_RE = /^[А-ЯҐЄІЇа-яґєіїA-Za-z][А-ЯҐЄІЇа-яґєіїA-Za-z\s'\-]{1,}$/;
const PHONE_RE = /^(\+?38)?0\d{9}$|^\+?[1-9]\d{6,14}$/;

const inputBase = "w-full p-3 border rounded-lg focus:ring-2 outline-none text-slate-900 bg-white transition-shadow";
const inputNormal = `${inputBase} border-slate-300 focus:ring-blue-500`;
const inputInvalid = `${inputBase} border-red-400 focus:ring-red-300`;

export const BookingWizard: React.FC<BookingWizardProps> = ({ service, onBack, onComplete }) => {
  const todayLocal = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const [step, setStep] = useState<number>(1);
  const [date, setDate] = useState<string>(todayLocal);
  const [time, setTime] = useState<string>("");
  const [masterId, setMasterId] = useState<string | null>(null);
  const [anyMaster, setAnyMaster] = useState<boolean>(true);

  const [masters, setMasters] = useState<Master[]>([]);
  const [mastersLoading, setMastersLoading] = useState(true);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string; address?: string }>({});

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const skipNextFetch = useRef(false);
  const addressWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient<Master[]>("/api/masters")
      .then((all) => {
        const qualified = service.specializationId
          ? all.filter((m) => m.specializations.some((s) => s.id === service.specializationId))
          : all;
        setMasters(qualified);
      })
      .catch(() => setMasters([]))
      .finally(() => setMastersLoading(false));
  }, [service.specializationId]);

  useEffect(() => {
    if (!date) return;
    if (!anyMaster && masterId === null) {
      setSlots([]);
      return;
    }

    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;

      setSlotsLoading(true);
      setTime("");

      const url = anyMaster
        ? `/api/schedule/slots/any?serviceId=${service.id}&date=${date}`
        : `/api/schedule/slots?masterId=${masterId}&serviceId=${service.id}&date=${date}`;

      try {
        const data = await apiClient<TimeSlot[]>(url);
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
  }, [anyMaster, masterId, date, service.id]);

  useEffect(() => {
    const query = formData.address.trim();

    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);
        const data: { predictions: { place_id: string; description: string; lat: number; lng: number }[] } = await res.json();
        const mapped: AddressSuggestion[] = data.predictions.map((p) => ({
          place_id: p.place_id,
          display_name: p.description,
          lat: p.lat,
          lng: p.lng,
        }));
        setSuggestions(mapped);
        setShowSuggestions(mapped.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.address]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addressWrapperRef.current && !addressWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectSuggestion = (s: AddressSuggestion) => {
    skipNextFetch.current = true;
    setFormData((prev) => ({ ...prev, address: s.display_name }));
    setSuggestions([]);
    setShowSuggestions(false);
    setCoords({ lat: s.lat, lng: s.lng });
  };

  const validateStep2 = (): boolean => {
    const errs: { name?: string; phone?: string; address?: string } = {};
    const name = formData.name.trim();
    if (name.length < 2 || !NAME_RE.test(name)) {
      errs.name = "Введіть коректне ім'я (тільки літери, мінімум 2 символи)";
    }
    const phoneNorm = formData.phone.trim().replace(/[\s\-().]/g, "");
    if (!PHONE_RE.test(phoneNorm)) {
      errs.phone = "Введіть коректний номер телефону (напр. +380501234567)";
    }
    if (!formData.address.trim()) {
      errs.address = "Вкажіть адресу об'єкта";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleModeChange = (any: boolean) => {
    if (any === anyMaster) return;
    setAnyMaster(any);
    setMasterId(null);
    setTime("");
    setSlots([]);
  };

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!time) return;
    if (!anyMaster && masterId === null) return;
    if (!validateStep2()) return;
    onComplete({
      serviceId: service.id,
      masterId: anyMaster ? undefined : masterId!,
      date,
      startTime: time,
      clientName: formData.name,
      phone: formData.phone.trim().replace(/[\s\-().]/g, ""),
      address: formData.address,
      latitude: coords ? String(coords.lat) : undefined,
      longitude: coords ? String(coords.lng) : undefined,
    });
  };

  const selectedMaster = masters.find((m) => m.id === masterId);

  const renderSlots = () => {
    if (!anyMaster && masterId === null) {
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
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
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

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100">
        <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-t-2xl overflow-hidden">
          <h2 className="text-xl sm:text-2xl font-bold mb-1">Оформлення запису</h2>
          <p className="text-slate-400 text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="bg-slate-800 px-2 py-0.5 rounded text-white">{service.title}</span>
            <span>•</span>
            <span>{service.durationMinutes} хв</span>
            <span>•</span>
            <span>{service.price === 0 ? "Безкоштовно" : `${service.price} ₴`}</span>
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-center mb-6 sm:mb-8 text-xs sm:text-sm">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-blue-600 font-bold" : "text-slate-400"}`}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border flex-shrink-0 ${step >= 1 ? "bg-blue-100 border-blue-600" : "border-slate-300"}`}
              >
                1
              </div>
              Майстер і Час
            </div>
            <div className="h-px bg-slate-200 grow mx-2 sm:mx-4" />
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-blue-600 font-bold" : "text-slate-400"}`}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border flex-shrink-0 ${step >= 2 ? "bg-blue-100 border-blue-600" : "border-slate-300"}`}
              >
                2
              </div>
              Деталі
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Призначення майстра</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleModeChange(true)}
                    className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      anyMaster ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Будь-який вільний майстер
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange(false)}
                    className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      !anyMaster ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Обрати майстра
                  </button>
                </div>
                {anyMaster && (
                  <p className="text-xs text-slate-500 mt-2">Система автоматично призначить першого вільного кваліфікованого майстра на обраний час.</p>
                )}
              </div>

              {!anyMaster && (
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
                            <div className="text-xs text-slate-500">{m.specializations.map((s) => s.name).join(", ") || "Майстер"}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="booking-date" className="block text-sm font-medium text-slate-700 mb-2">
                  Оберіть дату
                </label>
                <input
                  id="booking-date"
                  type="date"
                  value={date}
                  min={todayLocal}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDate(!val || val < todayLocal ? todayLocal : val);
                  }}
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
                  disabled={!time || (!anyMaster && masterId === null)}
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
                  <span className="opacity-80">
                    Майстер: {anyMaster ? "будь-який вільний (призначається автоматично)" : selectedMaster?.fullName}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="client-name" className="block text-sm font-medium text-slate-700 mb-1">
                    Ваше Ім&apos;я
                  </label>
                  <input
                    id="client-name"
                    type="text"
                    className={formErrors.name ? inputInvalid : inputNormal}
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Іван Іванов"
                  />
                  {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
                </div>

                <div>
                  <label htmlFor="client-phone" className="block text-sm font-medium text-slate-700 mb-1">
                    Телефон
                  </label>
                  <input
                    id="client-phone"
                    type="tel"
                    className={formErrors.phone ? inputInvalid : inputNormal}
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="+380 50 123 4567"
                  />
                  {formErrors.phone && <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="client-address" className="block text-sm font-medium text-slate-700 mb-1">
                    Адреса об&apos;єкта
                  </label>
                  <div className="relative" ref={addressWrapperRef}>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        id="client-address"
                        type="text"
                        className={`${formErrors.address ? inputInvalid : inputNormal} pl-9`}
                        value={formData.address}
                        onChange={(e) => {
                          setCoords(null);
                          setFormData({ ...formData, address: e.target.value });
                          if (formErrors.address) setFormErrors((prev) => ({ ...prev, address: undefined }));
                        }}
                        onFocus={() => {
                          if (suggestions.length > 0) setShowSuggestions(true);
                        }}
                        placeholder="м. Київ, вул. Хрещатик 1"
                        autoComplete="off"
                      />
                    </div>
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {suggestions.map((s) => (
                          <li
                            key={s.place_id}
                            onMouseDown={() => selectSuggestion(s)}
                            className="px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center gap-2"
                          >
                            <MapPin className="w-3 h-3 flex-shrink-0 text-slate-400" />
                            {s.display_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {formErrors.address && <p className="mt-1 text-xs text-red-500">{formErrors.address}</p>}
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
