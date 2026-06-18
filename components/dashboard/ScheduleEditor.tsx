"use client";

import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { apiClient } from "@/utils/apiClient";
import type { ScheduleItem } from "@/types";

interface ScheduleEditorProps {
  masterId: string;
  onToast: (message: string, type: "success" | "error") => void;
}

const DAY_NAMES = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "Пʼятниця", "Субота"];
const WORK_DAYS = [1, 2, 3, 4, 5, 6, 0];

interface DayState {
  isWorkingDay: boolean;
  startTime: string;
  endTime: string;
}

const DEFAULT_DAY: DayState = { isWorkingDay: false, startTime: "09:00", endTime: "18:00" };

export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ masterId, onToast }) => {
  const [schedule, setSchedule] = useState<Record<number, DayState>>(
    Object.fromEntries(WORK_DAYS.map((d) => [d, { ...DEFAULT_DAY }]))
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const items = await apiClient<ScheduleItem[]>(`/api/schedule/${masterId}`);
        if (items && items.length > 0) {
          const map: Record<number, DayState> = Object.fromEntries(
            WORK_DAYS.map((d) => [d, { ...DEFAULT_DAY }])
          );
          items.forEach((item) => {
            map[item.dayOfWeek] = {
              isWorkingDay: item.isWorkingDay,
              startTime: item.startTime.slice(0, 5),
              endTime: item.endTime.slice(0, 5),
            };
          });
          setSchedule(map);
        }
      } catch {
        onToast("Не вдалося завантажити розклад", "error");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [masterId]);

  const handleSave = async () => {
    for (const day of WORK_DAYS) {
      const d = schedule[day];
      if (d.isWorkingDay && d.startTime >= d.endTime) {
        onToast(`${DAY_NAMES[day]}: час кінця має бути після початку`, "error");
        return;
      }
    }
    setIsSaving(true);
    try {
      const payload = WORK_DAYS.map((d) => ({
        dayOfWeek: d,
        startTime: schedule[d].startTime + ":00",
        endTime: schedule[d].endTime + ":00",
        isWorkingDay: schedule[d].isWorkingDay,
      }));
      await apiClient(`/api/schedule/${masterId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      onToast("Розклад збережено", "success");
    } catch {
      onToast("Помилка збереження розкладу", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const update = (day: number, patch: Partial<DayState>) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-slate-900">День</th>
              <th className="px-6 py-4 text-left font-semibold text-slate-900">Робочий</th>
              <th className="px-6 py-4 text-left font-semibold text-slate-900">Початок</th>
              <th className="px-6 py-4 text-left font-semibold text-slate-900">Кінець</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {WORK_DAYS.map((day) => {
              const d = schedule[day];
              return (
                <tr key={day} className={d.isWorkingDay ? "bg-white" : "bg-slate-50"}>
                  <td className="px-6 py-4 font-medium text-slate-900">{DAY_NAMES[day]}</td>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={d.isWorkingDay}
                      onChange={(e) => update(day, { isWorkingDay: e.target.checked })}
                      className="w-4 h-4 accent-blue-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="time"
                      disabled={!d.isWorkingDay}
                      value={d.startTime}
                      onChange={(e) => update(day, { startTime: e.target.value })}
                      className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-40 disabled:bg-slate-50"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="time"
                      disabled={!d.isWorkingDay}
                      value={d.endTime}
                      onChange={(e) => update(day, { endTime: e.target.value })}
                      className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-40 disabled:bg-slate-50"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" /> {isSaving ? "Збереження..." : "Зберегти розклад"}
        </button>
      </div>
    </div>
  );
};
