"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Service } from "@/types";
import { ServiceCard } from "@/components/guest/ServiceCard";

interface ServiceCatalogProps {
  services: Service[];
  onSelect: (service: Service) => void;
}

const UNCATEGORIZED_ID = "__none";
const UNCATEGORIZED_NAME = "Інші";

const pill = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
    active
      ? "bg-blue-600 text-white border-blue-600"
      : "bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600"
  }`;

const catId = (s: Service) => s.specializationId || UNCATEGORIZED_ID;
const catName = (s: Service) => s.specializationName || UNCATEGORIZED_NAME;

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({ services, onSelect }) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    services.forEach((s) => map.set(catId(s), catName(s)));
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name, "uk")
    );
  }, [services]);

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = services.filter((s) => {
      if (activeCategory && catId(s) !== activeCategory) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    });

    const byCat = new Map<string, Service[]>();
    filtered.forEach((s) => {
      const id = catId(s);
      const list = byCat.get(id);
      if (list) list.push(s);
      else byCat.set(id, [s]);
    });

    return Array.from(byCat, ([id, list]) => ({
      id,
      name: catName(list[0]),
      services: [...list].sort((a, b) => a.title.localeCompare(b.title, "uk")),
    })).sort((a, b) => a.name.localeCompare(b.name, "uk"));
  }, [services, search, activeCategory]);

  const isEmpty = groups.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук послуги..."
            className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setActiveCategory("")} className={pill(activeCategory === "")}>
              Всі
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={pill(activeCategory === c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="text-center py-16 text-slate-500">Нічого не знайдено</div>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.id}>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">{group.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.services.map((s) => (
                  <ServiceCard key={s.id} service={s} onSelect={onSelect} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
