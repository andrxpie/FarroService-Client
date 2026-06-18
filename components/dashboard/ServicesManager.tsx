"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2, Check, Search, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { apiClient } from "@/utils/apiClient";
import type { Service, Specialization, CreateServicePayload, UpdateServicePayload } from "@/types";
import { ServicesFilters, ServiceFilterState, DEFAULT_SERVICE_FILTERS } from "./ServicesFilters";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

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
type SortDir = "asc" | "desc" | null;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ServiceFilterState>(DEFAULT_SERVICE_FILTERS);
  const [priceSort, setPriceSort] = useState<SortDir>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    try {
      await apiClient(`/api/services/${id}`, { method: "DELETE" });
      onServicesChange(services.filter((s) => s.id !== id));
      onToast("Послугу видалено", "success");
    } catch {
      onToast("Помилка видалення", "error");
    }
  };

  const handleToggleStatus = async (s: Service) => {
    const payload: UpdateServicePayload = {
      title: s.title,
      description: s.description,
      durationMinutes: s.durationMinutes,
      price: s.price,
      isActive: !s.isActive,
      specializationId: s.specializationId ?? "",
    };
    try {
      await apiClient(`/api/services/${s.id}`, { method: "PUT", body: JSON.stringify(payload) });
      onServicesChange(services.map((svc) => svc.id === s.id ? { ...svc, isActive: !svc.isActive } : svc));
    } catch {
      onToast("Не вдалося змінити статус", "error");
    }
  };

  const cycleSort = () => {
    setPriceSort((prev) => prev === null ? "asc" : prev === "asc" ? "desc" : null);
  };

  const q = searchQuery.toLowerCase().trim();
  const filtered = services.filter((s) => {
    if (q && !s.title.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false;
    if (filters.specializationIds.length > 0 && !filters.specializationIds.includes(s.specializationId ?? "")) return false;
    if (filters.minDuration !== null && s.durationMinutes < filters.minDuration) return false;
    if (filters.maxDuration !== null && s.durationMinutes > filters.maxDuration) return false;
    if (filters.minPrice !== null && s.price < filters.minPrice) return false;
    if (filters.maxPrice !== null && s.price > filters.maxPrice) return false;
    if (filters.status === "active" && !s.isActive) return false;
    if (filters.status === "inactive" && s.isActive) return false;
    return true;
  });

  const sorted = priceSort
    ? [...filtered].sort((a, b) => priceSort === "asc" ? a.price - b.price : b.price - a.price)
    : filtered;

  return (
    <div className="space-y-4">
      <div className="flex gap-6 items-start">
        {/* Left sidebar */}
        <aside className="w-56 flex-shrink-0 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Пошук послуги..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
            />
          </div>
          <ServicesFilters specializations={specializations} filters={filters} onChange={setFilters} />
        </aside>

        {/* Right: table */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Card header with button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <span className="font-semibold text-slate-900 text-sm">Список послуг</span>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Додати послугу
            </button>
          </div>

          <div className="overflow-auto max-h-[480px]">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="sticky top-0 z-10 bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Назва</th>
                  <th className="px-6 py-4">Спеціалізація</th>
                  <th className="px-6 py-4">Тривалість</th>
                  <th
                    className="px-6 py-4 cursor-pointer select-none hover:text-blue-600 transition-colors"
                    onClick={cycleSort}
                  >
                    <span className="flex items-center gap-1">
                      Ціна
                      {priceSort === null && <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />}
                      {priceSort === "asc" && <ChevronUp className="w-3.5 h-3.5 text-blue-600" />}
                      {priceSort === "desc" && <ChevronDown className="w-3.5 h-3.5 text-blue-600" />}
                    </span>
                  </th>
                  <th className="px-6 py-4">Статус</th>
                  <th className="px-6 py-4 text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{s.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{s.description}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{s.specializationName ?? "—"}</td>
                    <td className="px-6 py-4">{s.durationMinutes} хв</td>
                    <td className="px-6 py-4 font-medium">{s.price} грн</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(s)}
                        title="Натисніть для зміни статусу"
                        className="cursor-pointer"
                      >
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold transition-colors duration-150 hover:opacity-75 ${
                            s.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {s.isActive ? "Активна" : "Неактивна"}
                        </span>
                      </button>
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
                          onClick={() => setDeleteId(s.id)}
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
          {sorted.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              {searchQuery || filters.specializationIds.length > 0 || filters.status !== "all" || filters.minDuration !== null || filters.maxDuration !== null || filters.minPrice !== null || filters.maxPrice !== null
                ? "За вашим запитом нічого не знайдено"
                : "Послуг не знайдено"}
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <Modal
          title={editingId ? "Редагування послуги" : "Нова послуга"}
          subtitle={editingId ? "Змініть потрібні поля та збережіть" : "Заповніть дані нової послуги"}
          onClose={() => setShowForm(false)}
        >
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
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <ConfirmModal
          message="Видалити цю послугу? Дію неможливо скасувати."
          onConfirm={() => { handleDelete(deleteId); setDeleteId(null); }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};
