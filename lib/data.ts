import { Service, Master, Booking } from "@/types";

export const SERVICES: Service[] = [
  {
    id: 1,
    title: "Консультація",
    price: 0,
    duration: 30,
    description: "Допомога у виборі сантехніки та планування розводки.",
  },
  {
    id: 2,
    title: "Монтаж змішувача",
    price: 500,
    duration: 60,
    description: "Демонтаж старого та встановлення нового змішувача.",
  },
  {
    id: 3,
    title: "Встановлення бойлера",
    price: 1800,
    duration: 120,
    description: "Монтаж, підключення до водопроводу та електромережі.",
  },
  {
    id: 4,
    title: "Комплексний ремонт ванної",
    price: 15000,
    duration: 480,
    description: "Розводка труб, монтаж інсталяції, ванни та умивальника.",
  },
];

export const MASTERS: Master[] = [
  {
    id: 101,
    name: "Олександр Петренко",
    role: "Сантехнік-монтажник",
    rating: 4.9,
  },
  {
    id: 102,
    name: "Дмитро Коваль",
    role: "Інженер-проектувальник",
    rating: 5.0,
  },
  { id: 103, name: "Ірина Василенко", role: "Консультант", rating: 4.8 },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 1,
    serviceId: 2,
    masterId: 101,
    date: "2023-10-25",
    time: "10:00",
    client: "Андрій К.",
    status: "confirmed",
    address: "вул. Соборна 12",
  },
  {
    id: 2,
    serviceId: 3,
    masterId: 101,
    date: "2023-10-25",
    time: "14:00",
    client: "Олена М.",
    status: "pending",
    phone: "+380501112233",
  },
  {
    id: 3,
    serviceId: 1,
    masterId: 103,
    date: "2023-10-26",
    time: "09:00",
    client: "Віктор Р.",
    status: "completed",
  },
];
