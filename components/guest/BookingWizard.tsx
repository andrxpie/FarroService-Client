import React, { useState, useMemo, FormEvent } from "react";
import { ChevronLeft, ChevronRight, Calendar, AlertCircle } from "lucide-react";
import { Service, Booking } from "@/types";
import { MASTERS } from "@/lib/data";
import { generateTimeSlots } from "@/lib/utils";

interface BookingWizardProps {
  service: Service;
  bookings: Booking[];
  onBack: () => void;
  onComplete: (data: Partial<Booking>) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  service,
  bookings,
  onBack,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);

  // ВИПРАВЛЕННЯ: Ініціалізуємо дату відразу, без useEffect
  // Це безпечно, оскільки BookingWizard з'являється тільки після кліку (на клієнті)
  const [date, setDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );

  const [time, setTime] = useState<string>("");
  const [masterId, setMasterId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // useMemo перераховує слоти тільки коли змінюються залежності
  const slots = useMemo(() => {
    if (!date || !masterId) return [];
    const masterBookings = bookings.filter((b) => b.masterId === masterId);
    return generateTimeSlots(date, service.duration, masterBookings);
  }, [date, masterId, bookings, service.duration]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!masterId) return;

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
      <button
        onClick={onBack}
        className="text-slate-500 hover:text-slate-900 flex items-center mb-6 text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Повернутися до послуг
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6">
          <h2 className="text-2xl font-bold mb-1">Оформлення запису</h2>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            <span className="bg-slate-800 px-2 py-0.5 rounded text-white">
              {service.title}
            </span>
            <span>•</span>
            <span>{service.duration} хв</span>
            <span>•</span>
            <span>
              {service.price === 0 ? "Безкоштовно" : `${service.price} ₴`}
            </span>
          </p>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center mb-8 text-sm">
            <div
              className={`flex items-center gap-2 ${
                step >= 1 ? "text-blue-600 font-bold" : "text-slate-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  step >= 1 ? "bg-blue-100 border-blue-600" : "border-slate-300"
                }`}
              >
                1
              </div>
              Майстер і Час
            </div>
            <div className="h-px bg-slate-200 grow mx-4"></div>
            <div
              className={`flex items-center gap-2 ${
                step >= 2 ? "text-blue-600 font-bold" : "text-slate-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  step >= 2 ? "bg-blue-100 border-blue-600" : "border-slate-300"
                }`}
              >
                2
              </div>
              Деталі
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Оберіть майстра
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MASTERS.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setMasterId(m.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        masterId === m.id
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {m.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-slate-900">
                          {m.name}
                        </div>
                        <div className="text-xs text-slate-500">{m.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Оберіть дату
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Доступні слоти
                  {masterId && (
                    <span className="text-slate-400 font-normal ml-2">
                      (на основі графіка майстра)
                    </span>
                  )}
                </label>
                {!masterId ? (
                  <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-sm text-center border border-dashed border-slate-300">
                    Спочатку оберіть майстра
                  </div>
                ) : slots.length === 0 ? (
                  <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Немає вільних слотів на цю дату.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {slots.map((s) => (
                      <button
                        key={s}
                        onClick={() => setTime(s)}
                        className={`py-2 px-1 text-sm rounded-lg font-medium transition-colors ${
                          time === s
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  disabled={!time || !masterId}
                  onClick={() => setStep(2)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                    {date}, {time}
                  </span>
                  <span className="opacity-80">
                    Майстер: {MASTERS.find((m) => m.id === masterId)?.name}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ваше Ім&apos;я
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Іван Іванов"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Телефон
                  </label>
                  <input
                    required
                    type="tel"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+380 50 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Адреса об&apos;єкта
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="м. Київ, вул. Хрещатик 1, кв 10"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-600 font-medium hover:text-slate-900"
                >
                  Назад
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
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
