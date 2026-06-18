"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Loader2, MapPin } from "lucide-react";
import { apiClient } from "@/utils/apiClient";
import type { Booking, BookingStatus, Master, Service, UpdateBookingPayload } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";

interface EditBookingModalProps {
  booking: Booking | null;
  onClose: () => void;
  onSaved: (booking: Booking) => void;
  onToast: (message: string, type: "success" | "error") => void;
}

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

const NAME_RE = /^[А-ЯҐЄІЇа-яґєіїA-Za-z][А-ЯҐЄІЇа-яґєіїA-Za-z\s'\-]{1,}$/;
const PHONE_RE = /^(\+?38)?0\d{9}$|^\+?[1-9]\d{6,14}$/;

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: "Pending", label: "Очікує" },
  { value: "Confirmed", label: "Підтверджено" },
  { value: "Completed", label: "Виконано" },
  { value: "Cancelled", label: "Скасовано" },
];

const base = "w-full border rounded-lg p-2.5 text-sm text-slate-900 bg-white focus:ring-2 outline-none transition-shadow";
const normal = `${base} border-slate-300 focus:ring-blue-500`;
const invalid = `${base} border-red-400 focus:ring-red-300`;

type FormErrors = { [key: string]: string };

export const EditBookingModal: React.FC<EditBookingModalProps> = ({ booking, onClose, onSaved, onToast }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [masters, setMasters] = useState<Master[]>([]);

  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [masterId, setMasterId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState<BookingStatus>("Pending");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // Address autocomplete
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const skipNextFetch = useRef(false);
  const addressWrapperRef = useRef<HTMLDivElement>(null);

  const originalDate = booking ? booking.bookingDate.split("T")[0] : "";

  // Prefill form & load reference data when a booking is opened for editing
  useEffect(() => {
    if (!booking) return;

    setClientName(booking.clientName);
    setPhone(booking.clientPhone);
    setServiceId(booking.serviceId);
    setMasterId(booking.masterId);
    setDate(booking.bookingDate.split("T")[0]);
    setTime(booking.startTime);
    setStatus(booking.status);
    setAddress(booking.address ?? "");
    setComment(booking.comment ?? "");
    setCoords(
      booking.latitude && booking.longitude
        ? { lat: Number(booking.latitude), lng: Number(booking.longitude) }
        : null
    );
    setErrors({});
    skipNextFetch.current = true;

    apiClient<Service[]>("/api/services?includeAll=true").then(setServices).catch(() => setServices([]));
    apiClient<Master[]>("/api/masters").then(setMasters).catch(() => setMasters([]));
  }, [booking]);

  const selectedService = services.find((s) => s.id === serviceId);
  const qualifiedMasters = selectedService?.specializationId
    ? masters.filter((m) => m.specializations.some((sp) => sp.id === selectedService.specializationId))
    : masters;

  const isOriginalContext =
    !!booking && masterId === booking.masterId && date === originalDate && serviceId === booking.serviceId;

  // Load available slots for the chosen master/service/date
  useEffect(() => {
    if (!booking || !masterId || !serviceId || !date) {
      setSlots([]);
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);

    apiClient<TimeSlot[]>(`/api/schedule/slots?masterId=${masterId}&serviceId=${serviceId}&date=${date}`)
      .then((data) => {
        if (cancelled) return;
        setSlots(data);
        // Keep original time preselected only when nothing about the slot context changed
        setTime(isOriginalContext ? booking.startTime : "");
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking, masterId, serviceId, date]);

  // The current booking occupies its own slot, so re-enable it in the original context
  const displaySlots = slots
    .map((s) => (isOriginalContext && s.time === booking?.startTime ? { ...s, isAvailable: true } : s))
    .filter((s) => s.isAvailable);

  // Debounced address autocomplete
  useEffect(() => {
    const query = address.trim();
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
        const mapped = data.predictions.map((p) => ({
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
  }, [address]);

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
    setAddress(s.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    setCoords({ lat: s.lat, lng: s.lng });
  };

  const clearErr = (field: string) => {
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };
  const cls = (field: string) => (errors[field] ? invalid : normal);

  const handleServiceChange = (val: string) => {
    setServiceId(val);
    clearErr("serviceId");
    // Drop the master if it is no longer qualified for the newly chosen service
    const svc = services.find((s) => s.id === val);
    if (svc?.specializationId && masterId) {
      const master = masters.find((m) => m.id === masterId);
      if (!master?.specializations.some((sp) => sp.id === svc.specializationId)) {
        setMasterId("");
      }
    }
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    const name = clientName.trim();
    if (name.length < 2 || !NAME_RE.test(name)) e.clientName = "Введіть коректне ім'я (мінімум 2 літери)";
    const phoneNorm = phone.trim().replace(/[\s\-().]/g, "");
    if (!PHONE_RE.test(phoneNorm)) e.phone = "Некоректний номер телефону";
    if (!serviceId) e.serviceId = "Оберіть послугу";
    if (!masterId) e.masterId = "Оберіть майстра";
    if (!date) e.date = "Оберіть дату";
    if (!time) e.time = "Оберіть час";
    if (!address.trim()) e.address = "Вкажіть адресу";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !validate()) return;

    setIsSaving(true);
    const payload: UpdateBookingPayload = {
      clientName: clientName.trim(),
      phone: phone.trim().replace(/[\s\-().]/g, ""),
      serviceId,
      masterId,
      date,
      startTime: time,
      status,
      address: address.trim(),
      comment: comment.trim() || undefined,
      latitude: coords ? String(coords.lat) : undefined,
      longitude: coords ? String(coords.lng) : undefined,
    };

    try {
      const updated = await apiClient<Booking>(`/api/bookings/${booking.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      onSaved(updated);
      onToast("Бронювання оновлено", "success");
      onClose();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Не вдалося зберегти зміни", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const renderSlots = () => {
    if (!masterId) {
      return <div className="p-3 bg-slate-50 rounded-lg text-slate-500 text-xs text-center border border-dashed border-slate-300">Спочатку оберіть майстра</div>;
    }
    if (slotsLoading) {
      return <div className="flex items-center gap-2 text-slate-400 text-xs p-3"><Loader2 className="w-4 h-4 animate-spin" /> Завантаження слотів...</div>;
    }
    if (displaySlots.length === 0) {
      return <div className="p-3 bg-slate-50 rounded-lg text-slate-500 text-xs text-center border border-dashed border-slate-300">Немає доступних слотів на цю дату</div>;
    }
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 max-h-32 overflow-y-auto">
        {displaySlots.map((slot) => (
          <button
            key={slot.time}
            type="button"
            onClick={() => { setTime(slot.time); clearErr("time"); }}
            className={`py-1.5 px-1 text-xs rounded-lg font-medium transition-all text-center cursor-pointer ${
              time === slot.time
                ? "bg-blue-600 text-white border border-blue-600 shadow"
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
    <Modal
      isOpen={!!booking}
      title="Редагування запису"
      subtitle="Змініть потрібні поля та збережіть"
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ім&apos;я клієнта</label>
          <input className={cls("clientName")} value={clientName} onChange={(e) => { setClientName(e.target.value); clearErr("clientName"); }} placeholder="Іван Іванов" />
          {errors.clientName && <p className="mt-1 text-xs text-red-500">{errors.clientName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Телефон</label>
          <input className={cls("phone")} value={phone} onChange={(e) => { setPhone(e.target.value); clearErr("phone"); }} placeholder="+380501234567" />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Послуга</label>
          <Select
            value={serviceId}
            onChange={handleServiceChange}
            options={services.map((s) => ({ value: s.id, label: s.title }))}
            error={!!errors.serviceId}
          />
          {errors.serviceId && <p className="mt-1 text-xs text-red-500">{errors.serviceId}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Майстер</label>
          <Select
            value={masterId}
            onChange={(val) => { setMasterId(val); clearErr("masterId"); }}
            options={qualifiedMasters.map((m) => ({ value: m.id, label: m.fullName }))}
            error={!!errors.masterId}
          />
          {errors.masterId && <p className="mt-1 text-xs text-red-500">{errors.masterId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Дата</label>
          <input type="date" className={cls("date")} value={date} onChange={(e) => { setDate(e.target.value); clearErr("date"); }} />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Статус</label>
          <Select
            value={status}
            onChange={(val) => setStatus(val as BookingStatus)}
            options={STATUS_OPTIONS}
            placeholder=""
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Час</label>
          {renderSlots()}
          {errors.time && <p className="mt-1 text-xs text-red-500">{errors.time}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Адреса</label>
          <div className="relative" ref={addressWrapperRef}>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                className={`${cls("address")} pl-9`}
                value={address}
                onChange={(e) => { setCoords(null); setAddress(e.target.value); clearErr("address"); }}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
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
          {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Коментар</label>
          <textarea rows={2} className={`${normal} resize-none`} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Додаткові нотатки" />
        </div>

        <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">
            Скасувати
          </button>
          <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Зберегти
          </button>
        </div>
      </form>
    </Modal>
  );
};
