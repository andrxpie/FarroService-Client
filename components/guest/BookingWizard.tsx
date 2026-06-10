import React, { useState, useMemo, FormEvent } from "react";
import { ChevronLeft, ChevronRight, Calendar, AlertCircle } from "lucide-react";
import { Service, Booking } from "@/types";
import { MASTERS } from "@/lib/data";

interface BookingWizardProps {
  service: Service;
  bookings: Booking[];
  onBack: () => void;
  onComplete: (data: Partial<Booking>) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({ service, bookings, onBack, onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState<string>("");
  const [masterId, setMasterId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // ГЕНЕРАЦІЯ СЛОТІВ: Створюємо повну сітку робочого дня майстра (з 09:00 до 18:00)
  // Та маркуємо кожен слот як вільний або зайнятий на основі активних bookings з бази даних
  const allSlotsWithStatus = useMemo(() => {
    if (!date || !masterId) return [];

    // Стандартна робоча сітка годин (можна розширити за потреби)
    const baseHours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

    // Фільтруємо записи з бази даних, які вже існують для цього майстра на обрану дату
    const activeMasterBookings = bookings.filter((b) => b.masterId === masterId && b.date === date && b.status !== "cancelled");

    return baseHours.map((slotTime) => {
      const isTaken = activeMasterBookings.some((b) => b.time === slotTime);
      return {
        timeValue: slotTime,
        isBooked: isTaken,
      };
    });
  }, [date, masterId, bookings]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!masterId || !time) return;

    // Створення DTO для відправки на ASP.NET Core API
    onComplete({
      serviceId: service.id,
      masterId: masterId,
      date,
      time,
      client: formData.name,
      phone: formData.phone,
      address: formData.address,
    });
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="text-slate-500 hover:text-slate-900 flex items-center mb-6 text-sm font-medium cursor-pointer">
        <ChevronLeft className="w-4 h-4 mr-1" /> Повернутися до послуг
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6">
          <h2 className="text-2xl font-bold mb-1">Оформлення запису</h2>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            <span className="bg-slate-800 px-2 py-0.5 rounded text-white">{service.title}</span>
            <span>•</span>
            <span>{service.duration} хв</span>
            <span>•</span>
            <span>{service.price === 0 ? "Безкоштовно" : `${service.price} ₴`}</span>
          </p>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center mb-8 text-sm">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-blue-600 font-bold" : "text-slate-400"}`}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 1 ? "bg-blue-100 border-blue-600" : "border-slate-300"}`}
              >
                1
              </div>
              Майстер і Час
            </div>
            <div className="h-px bg-slate-200 grow mx-4"></div>
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Оберіть майстра</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MASTERS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setMasterId(m.id);
                        setTime("");
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 text-left w-full ${
                        masterId === m.id ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 hover:border-blue-300 bg-white"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {m.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-slate-900">{m.name}</div>
                        <div className="text-xs text-slate-500">{m.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Оберіть дату</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTime("");
                  }}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Доступні слоти
                  {masterId && <span className="text-slate-400 font-normal ml-2">(червоні слоти вже зайняті)</span>}
                </label>
                {!masterId ? (
                  <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-sm text-center border border-dashed border-slate-300">
                    Спочатку оберіть майстра
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {allSlotsWithStatus.map((slot) => (
                      <button
                        key={slot.timeValue}
                        type="button"
                        disabled={slot.isBooked}
                        onClick={() => setTime(slot.timeValue)}
                        className={`py-2 px-1 text-sm rounded-lg font-medium transition-all text-center ${
                          slot.isBooked
                            ? "bg-red-50 border border-red-200 text-red-400 line-through opacity-70 cursor-not-allowed" // ЗАЙНЯТИЙ СЛОТ (ВИДІЛЕНО ЧЕРВОНИМ)
                            : time === slot.timeValue
                              ? "bg-blue-600 text-white border border-blue-600 shadow-md"
                              : "bg-white border border-slate-200 text-slate-700 hover:border-blue-400 cursor-pointer"
                        }`}
                      >
                        {slot.timeValue}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!time || !masterId}
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
                    {date}, о {time}
                  </span>
                  <span className="opacity-80">Майстер: {MASTERS.find((m) => m.id === masterId)?.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ваше Ім'я</label>
                  <input
                    required
                    type="text"
                    // ВИПРАВЛЕННЯ БАГУ: text-slate-900 робить текст чітким та видимим
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-white"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Іван Іванов"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Телефон</label>
                  <input
                    required
                    type="tel"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-white"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+380 50 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Адреса об'єкта</label>
                  <input
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
