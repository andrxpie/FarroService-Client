import React from "react";
import { Clock } from "lucide-react";
import { Service } from "@/types";
import { Card } from "@/components/ui/Card";

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect }) => (
  <Card className="hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full group">
    <div className="p-5 flex flex-col grow">
      <h3 className="font-bold text-lg text-slate-900 mb-1">{service.title}</h3>
      <p className="text-sm text-slate-500 mb-4 grow">{service.description}</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm font-medium text-slate-400 flex items-center">
          <Clock className="w-4 h-4 mr-1" /> {service.durationMinutes} хв
        </span>
        <span className="font-bold text-blue-600 text-lg">{service.price === 0 ? "Безкоштовно" : `${service.price} ₴`}</span>
      </div>
      <button
        onClick={() => onSelect(service)}
        className="w-full mt-4 bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        Забронювати
      </button>
    </div>
  </Card>
);
