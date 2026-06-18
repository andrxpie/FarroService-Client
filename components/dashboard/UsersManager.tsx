"use client";

import React, { useState } from "react";
import { Plus, Trash2, Check, Pencil, Search, SlidersHorizontal } from "lucide-react";
import { apiClient } from "@/utils/apiClient";
import type { AdminUser, Specialization, CreateUserPayload, UpdateUserPayload } from "@/types";
import { UsersFilters, UserFilterState, DEFAULT_USER_FILTERS } from "./UsersFilters";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Select } from "@/components/ui/Select";

interface UsersManagerProps {
  users: AdminUser[];
  specializations: Specialization[];
  isMainAdmin: boolean;
  onUsersChange: (users: AdminUser[]) => void;
  onToast: (message: string, type: "success" | "error") => void;
}

const ALL_ROLES = ["Master", "Admin"];

const ROLE_LABEL: Record<string, string> = {
  Master: "Майстер",
  Admin: "Адмін",
  MainAdmin: "Головний адмін",
};

type FormErrors = { [key: string]: string };

const base = "w-full border rounded-lg p-2.5 text-sm text-slate-900 bg-white focus:ring-2 outline-none transition-shadow";
const normal = `${base} border-slate-300 focus:ring-blue-500`;
const invalid = `${base} border-red-400 focus:ring-red-300`;

const EMPTY_CREATE: CreateUserPayload = {
  email: "",
  password: "",
  fullName: "",
  role: "Master",
  specializationIds: [],
};

export const UsersManager: React.FC<UsersManagerProps> = ({
  users,
  specializations,
  isMainAdmin,
  onUsersChange,
  onToast,
}) => {
  const availableRoles = isMainAdmin ? ALL_ROLES : ["Master"];

  const [showCreate, setShowCreate] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserPayload>(EMPTY_CREATE);
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserPayload>({ fullName: "", email: "" });
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [isEditing, setIsEditing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [userFilters, setUserFilters] = useState<UserFilterState>(DEFAULT_USER_FILTERS);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const cls = (errs: FormErrors, field: string) => (errs[field] ? invalid : normal);
  const clearErr = (errs: FormErrors, setErrs: React.Dispatch<React.SetStateAction<FormErrors>>, field: string) => {
    if (errs[field]) setErrs((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateCreate = (): boolean => {
    const e: FormErrors = {};
    if (createForm.fullName.trim().length < 2) e.fullName = "Введіть ПІБ (мінімум 2 символи)";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim())) e.email = "Некоректний email";
    if (createForm.password.length < 6) e.password = "Мінімум 6 символів";
    if (createForm.role === "Master" && (!createForm.specializationIds || createForm.specializationIds.length === 0))
      e.specs = "Оберіть хоча б одну спеціалізацію";
    setCreateErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateEdit = (): boolean => {
    const e: FormErrors = {};
    if (editForm.fullName.trim().length < 2) e.fullName = "Введіть ПІБ (мінімум 2 символи)";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) e.email = "Некоректний email";
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };

  const toggleCreateSpec = (id: string) => {
    setCreateForm((prev) => {
      const ids = prev.specializationIds ?? [];
      return { ...prev, specializationIds: ids.includes(id) ? ids.filter((s) => s !== id) : [...ids, id] };
    });
    clearErr(createErrors, setCreateErrors, "specs");
  };

  const toggleEditSpec = (id: string) => {
    setEditForm((prev) => {
      const ids = prev.specializationIds ?? [];
      return { ...prev, specializationIds: ids.includes(id) ? ids.filter((s) => s !== id) : [...ids, id] };
    });
  };

  const openEdit = (u: AdminUser) => {
    setShowCreate(false);
    setEditingUser(u);
    setEditForm({
      fullName: u.fullName,
      email: u.email,
      specializationIds: u.specializations.map((s) => s.id),
      role: u.role,
    });
    setEditErrors({});
  };

  const cancelEdit = () => { setEditingUser(null); setEditErrors({}); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreate()) return;
    setIsSaving(true);
    try {
      await apiClient("/api/admin/users", { method: "POST", body: JSON.stringify(createForm) });
      const updated = await apiClient<AdminUser[]>("/api/admin/users");
      if (updated) onUsersChange(updated);
      onToast("Користувача створено", "success");
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE);
    } catch {
      onToast("Помилка створення користувача", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !validateEdit()) return;
    setIsEditing(true);
    try {
      const payload: UpdateUserPayload = {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        specializationIds: editForm.specializationIds,
        role: isMainAdmin ? editForm.role : undefined,
      };
      await apiClient(`/api/admin/users/${editingUser.id}`, { method: "PUT", body: JSON.stringify(payload) });
      const updated = await apiClient<AdminUser[]>(
        isMainAdmin ? "/api/admin/users" : "/api/admin/users?role=Master"
      );
      if (updated) onUsersChange(updated);
      onToast("Зміни збережено", "success");
      setEditingUser(null);
    } catch {
      onToast("Помилка збереження", "error");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient(`/api/admin/users/${id}`, { method: "DELETE" });
      onUsersChange(users.filter((u) => u.id !== id));
      onToast("Користувача видалено", "success");
    } catch {
      onToast("Помилка видалення", "error");
    }
  };

  const editingRole = editForm.role ?? editingUser?.role ?? "Master";
  const showEditSpecs = editingRole === "Master";

  const q = searchQuery.toLowerCase().trim();
  const filtered = users.filter((u) => {
    if (q && !u.fullName.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    if (userFilters.roles.length > 0 && !userFilters.roles.includes(u.role)) return false;
    return true;
  });

  const activeFilterCount = userFilters.roles.length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Пошук за ПІБ, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
            />
          </div>
          <button
            onClick={() => setShowFiltersModal(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer flex-shrink-0 ${
              activeFilterCount > 0
                ? "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Фільтри
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full font-bold leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
        {isMainAdmin && (
          <button
            onClick={() => { cancelEdit(); setCreateErrors({}); setCreateForm(EMPTY_CREATE); setShowCreate(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Додати користувача
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-auto max-h-[520px]">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ПІБ</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Роль</th>
                <th className="px-6 py-4">Спеціалізації</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className={`hover:bg-slate-50 transition-colors group ${editingUser?.id === u.id ? "bg-blue-50/50" : ""}`}>
                  <td className="px-6 py-4 font-medium text-slate-900">{u.fullName}</td>
                  <td className="px-6 py-4 text-slate-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {u.specializations.length > 0 ? u.specializations.map((s) => s.name).join(", ") : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {u.role !== "MainAdmin" && (
                        <button onClick={() => openEdit(u)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 cursor-pointer" title="Редагувати">
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {isMainAdmin && u.role !== "MainAdmin" && (
                        <button onClick={() => setDeleteId(u.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 cursor-pointer" title="Видалити">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            {searchQuery || activeFilterCount > 0 ? "За вашим запитом нічого не знайдено" : "Користувачів не знайдено"}
          </div>
        )}
      </div>

      {/* Filters modal */}
      <Modal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        title="Фільтри"
        subtitle="Звужте список користувачів"
        maxWidth="max-w-sm"
      >
        <UsersFilters filters={userFilters} onChange={setUserFilters} />
      </Modal>

      {/* Create user modal */}
      {isMainAdmin && (
        <Modal
          isOpen={showCreate}
          title="Новий користувач"
          subtitle="Заповніть дані нового співробітника"
          onClose={() => setShowCreate(false)}
        >
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ПІБ</label>
              <input
                className={cls(createErrors, "fullName")}
                value={createForm.fullName}
                onChange={(e) => { setCreateForm({ ...createForm, fullName: e.target.value }); clearErr(createErrors, setCreateErrors, "fullName"); }}
                placeholder="Іванов Іван Іванович"
              />
              {createErrors.fullName && <p className="mt-1 text-xs text-red-500">{createErrors.fullName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                className={cls(createErrors, "email")}
                value={createForm.email}
                onChange={(e) => { setCreateForm({ ...createForm, email: e.target.value }); clearErr(createErrors, setCreateErrors, "email"); }}
                placeholder="user@farro.ua"
              />
              {createErrors.email && <p className="mt-1 text-xs text-red-500">{createErrors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Пароль</label>
              <input
                type="password"
                className={cls(createErrors, "password")}
                value={createForm.password}
                onChange={(e) => { setCreateForm({ ...createForm, password: e.target.value }); clearErr(createErrors, setCreateErrors, "password"); }}
                placeholder="••••••••"
              />
              {createErrors.password && <p className="mt-1 text-xs text-red-500">{createErrors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Роль</label>
              <Select
                value={createForm.role}
                onChange={(val) => setCreateForm({ ...createForm, role: val, specializationIds: [] })}
                options={availableRoles.map((r) => ({ value: r, label: ROLE_LABEL[r] ?? r }))}
                placeholder=""
              />
            </div>
            {createForm.role === "Master" && specializations.length > 0 && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Спеціалізації</label>
                <div className="flex flex-wrap gap-2">
                  {specializations.map((sp) => {
                    const selected = createForm.specializationIds?.includes(sp.id);
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => toggleCreateSpec(sp.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                          selected
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                        }`}
                      >
                        {sp.name}
                      </button>
                    );
                  })}
                </div>
                {createErrors.specs && <p className="mt-1 text-xs text-red-500">{createErrors.specs}</p>}
              </div>
            )}
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer">
                Скасувати
              </button>
              <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
                <Check className="w-4 h-4" /> Зберегти
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit user modal */}
      <Modal
        isOpen={!!editingUser}
        title={editingUser ? `Редагування: ${editingUser.fullName}` : "Редагування"}
        subtitle="Змініть потрібні поля та збережіть"
        onClose={cancelEdit}
      >
        <form onSubmit={handleEditSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ПІБ</label>
            <input
              className={cls(editErrors, "fullName")}
              value={editForm.fullName}
              onChange={(e) => { setEditForm({ ...editForm, fullName: e.target.value }); clearErr(editErrors, setEditErrors, "fullName"); }}
            />
            {editErrors.fullName && <p className="mt-1 text-xs text-red-500">{editErrors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              className={cls(editErrors, "email")}
              value={editForm.email}
              onChange={(e) => { setEditForm({ ...editForm, email: e.target.value }); clearErr(editErrors, setEditErrors, "email"); }}
            />
            {editErrors.email && <p className="mt-1 text-xs text-red-500">{editErrors.email}</p>}
          </div>
          {isMainAdmin && editingUser?.role !== "MainAdmin" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Роль</label>
              <Select
                value={editForm.role ?? editingUser?.role ?? ""}
                onChange={(val) => setEditForm({ ...editForm, role: val, specializationIds: val === "Master" ? editForm.specializationIds : [] })}
                options={ALL_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] ?? r }))}
                placeholder=""
              />
            </div>
          )}
          {showEditSpecs && specializations.length > 0 && (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Спеціалізації</label>
              <div className="flex flex-wrap gap-2">
                {specializations.map((sp) => {
                  const selected = editForm.specializationIds?.includes(sp.id);
                  return (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => toggleEditSpec(sp.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                        selected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                      }`}
                    >
                      {sp.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={cancelEdit} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer">
              Скасувати
            </button>
            <button type="submit" disabled={isEditing} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
              <Check className="w-4 h-4" /> Зберегти зміни
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        message="Видалити цього користувача? Дію неможливо скасувати."
        onConfirm={() => { handleDelete(deleteId!); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
