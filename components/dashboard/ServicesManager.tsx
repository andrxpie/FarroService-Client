"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { apiClient } from "@/utils/apiClient";
import type { Service, Specialization, CreateServicePayload, UpdateServicePayload } from "@/types";

interface ServicesManagerProps {
  services: Service[];
  specializations: Specialization[];
  onServicesChange: (services: Service[]) => void;
  onToast: (message: string, type: "success" | "error") => void;
}

const EMPTY_FORM: CreateServicePayload = {
  title: "",
  description: "",
  durationMinutes: 60,
  price: 0,
  specializationId: "",
};

type FormErrors = { [key: string]: string };

const base = "w-full border rounded-lg p-2.5 text-sm text-slate-900 bg-white focus:ring-2 outline-none transition-shadow";
const normal = `${base} border-slate-300 focus:ring-blue-500`;
const invalid = `${base} border-red-400 focus:ring-red-300`;

export const ServicesManager: React.FC<ServicesManagerProps> = ({
  services,
  specializations,
  onServicesChange,
  onToast,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateServicePayload>(EMPTY_FORM);
  const [isActiveEdit, setIsActiveEdit] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const cls = (field: string) => (errors[field] ? invalid : normal);
  const clearErr = (field: string) => {
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (form.title.trim().length < 3) e.title = "Мінімум 3 символи";
    if (form.description.trim().length < 10) e.description = "Мінімум 10 символів";
    if (!form.durationMinutes || form.durationMinutes < 15) e.durationMinutes = "Мінімум 15 хв";
    if (form.price < 0) e.price = "Не може бути від'ємною";
    if (!form.specializationId) e.specializationId = "Оберіть спеціалізацію";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsActiveEdit(true);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (s: Service) => {
    setEditingId(s.id);
    setForm({
      title: s.title,
      description: s.description,
      durationMinutes: s.durationMinutes,
      price: s.price,
      specializationId: s.specializationId ?? "",
    });
    setIsActiveEdit(s.isActive);
    setErrors({});
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      if (editingId) {
        const payload: UpdateServicePayload = { ...form, isActive: isActiveEdit };
        await apiClient(`/api/services/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        onServicesChange(
          services.map((s) => (s.id === editingId ? { ...s, ...form, isActive: isActiveEdit } : s))
        );
        onToast("Послугу оновлено", "success");
      } else {
        const created = await apiClient<Service>("/api/services", {
          method: "POST",
          body: JSON.stringify(form),
        });
        if (created) onServicesChange([...services, created]);
        onToast("Послугу створено", "success");
      }
      setShowForm(false);
    } catch {
      onToast("Помилка збереження послуги", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Видалити послугу?")) return;
    try {
      await apiClient(`/api/services/${id}`, { method: "DELETE" });
      onServicesChange(services.filter((s) => s.id !== id));
      onToast("Послугу видалено", "success");
    } catch {
      onToast("Помилка видалення", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Додати послугу
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">
              {editingId ? "Редагувати послугу" : "Нова послуга"}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Назва</label>
              <input
                className={cls("title")}
                value={form.title}
                onChange={(e) => { setForm({ ...form, title: e.target.value }); clearErr("title"); }}
                placeholder="Назва послуги"
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Опис</label>
              <textarea
                rows={2}
                className={`${cls("description")} resize-none`}
                value={form.description}
                onChange={(e) => { setForm({ ...form, description: e.target.value }); clearErr("description"); }}
                placeholder="Детальний опис послуги"
              />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Тривалість (хв)</label>
              <input
                type="number"
                min={15}
                step={15}
                className={cls("durationMinutes")}
                value={form.durationMinutes}
                onChange={(e) => { setForm({ ...form, durationMinutes: Number(e.target.value) }); clearErr("durationMinutes"); }}
              />
              {errors.durationMinutes && <p className="mt-1 text-xs text-red-500">{errors.durationMinutes}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ціна (грн)</label>
              <input
                type="number"
                min={0}
                className={cls("price")}
                value={form.price}
                onChange={(e) => { setForm({ ...form, price: Number(e.target.value) }); clearErr("price"); }}
              />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Спеціалізація</label>
              <select
                className={cls("specializationId")}
                value={form.specializationId}
                onChange={(e) => { setForm({ ...form, specializationId: e.target.value }); clearErr("specializationId"); }}
              >
                <option value="">— Обрати —</option>
                {specializations.map((sp) => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
              {errors.specializationId && <p className="mt-1 text-xs text-red-500">{errors.specializationId}</p>}
            </div>
            {editingId && (
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="is-active"
                  checked={isActiveEdit}
                  onChange={(e) => setIsActiveEdit(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="is-active" className="text-sm font-medium text-slate-700">
                  Активна
                </label>
              </div>
            )}
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Зберегти
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Назва</th>
                <th className="px-6 py-4">Спеціалізація</th>
                <th className="px-6 py-4">Тривалість</th>
                <th className="px-6 py-4">Ціна</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{s.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{s.description}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{s.specializationName ?? "—"}</td>
                  <td className="px-6 py-4">{s.durationMinutes} хв</td>
                  <td className="px-6 py-4 font-medium">{s.price} грн</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        s.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {s.isActive ? "Активна" : "Неактивна"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 cursor-pointer"
                        title="Редагувати"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 cursor-pointer"
                        title="Видалити"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {services.length === 0 && (
          <div className="p-12 text-center text-slate-400">Послуг не знайдено</div>
        )}
      </div>
    </div>
  );
};
