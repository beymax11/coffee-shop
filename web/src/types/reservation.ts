export type ReservationType = "Coffee Cart Booking" | "Table Reservation" | "Private Event" | "Corporate Event";

export interface Reservation {
  fullName: string;
  email: string;
  phone: string;
  eventType: ReservationType;
  date: string;
  time: string;
  guestCount: number;
  location: string;
  notes?: string;
}
