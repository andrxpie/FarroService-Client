export type UserRole = "guest" | "master" | "admin";
export type ViewState = UserRole | "guest-booking";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Service {
  id: number;
  title: string;
  price: number;
  duration: number;
  description: string;
  image?: string;
}

export interface Master {
  id: number;
  name: string;
  role: string;
  rating: number;
}

export interface Booking {
  id: number;
  serviceId: number;
  masterId: number;
  date: string;
  time: string;
  client: string;
  status: BookingStatus;
  phone?: string;
  address?: string;
}

export interface ToastNotification {
  message: string;
  type: "success" | "info" | "error";
}
