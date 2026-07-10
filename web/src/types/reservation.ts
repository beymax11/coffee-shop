export type ReservationType = "Coffee Cart Booking" | "Table Reservation";

export interface Reservation {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  eventType: ReservationType;
  date: string;
  time: string;
  guestCount: number;
  location: string;
  notes?: string;
  status?: "Pending" | "Approved" | "Cancelled";
  created_at?: string;
}
