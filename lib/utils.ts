import { Booking } from "@/types";
import { SERVICES } from "@/lib/data";

export const generateTimeSlots = (
  date: string,
  duration: number,
  existingBookings: Booking[]
): string[] => {
  const slots: string[] = [];
  const startHour = 9;
  const endHour = 18;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${min
        .toString()
        .padStart(2, "0")}`;

      const slotStart = new Date(`2000-01-01T${timeString}`);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      if (slotEnd.getHours() >= 18 && slotEnd.getMinutes() > 0) continue;

      const isBusy = existingBookings.some((b) => {
        if (b.date !== date) return false;

        const bookingStart = new Date(`2000-01-01T${b.time}`);
        const service = SERVICES.find((s) => s.id === b.serviceId);
        const bookingDuration = service ? service.duration : 60;
        const bookingEnd = new Date(
          bookingStart.getTime() + bookingDuration * 60000
        );

        return slotStart < bookingEnd && slotEnd > bookingStart;
      });

      if (!isBusy) {
        slots.push(timeString);
      }
    }
  }
  return slots;
};
