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
  status?: "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed" | "Cancellation Requested";
  created_at?: string;
  paymentMethod?: "GCash" | "Bank Transfer" | "QRPh";
  referenceNumber?: string;
  proofOfPayment?: string;
  coffeeFlavor1?: string;
  coffeeFlavor2?: string;
  nonCoffeeFlavor1?: string;
  nonCoffeeFlavor2?: string;
  cancellationReason?: string;
}
