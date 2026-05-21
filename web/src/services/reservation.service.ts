import { Reservation, ReservationType } from "@/types";

export class ReservationService {
  /**
   * Generates a random transaction confirmation code.
   */
  static generateConfirmationCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "LN-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Validates step fields in the event reservation form.
   */
  static validateStep(
    step: number,
    data: Partial<Reservation>
  ): Partial<Record<keyof Reservation, string>> {
    const errors: Partial<Record<keyof Reservation, string>> = {};

    if (step === 1) {
      if (!data.eventType) {
        errors.eventType = "Please select an experience type";
      }
    } else if (step === 2) {
      if (!data.date) errors.date = "Date is required";
      if (!data.time) errors.time = "Time is required";
      
      const count = data.guestCount || 0;
      if (count <= 0) {
        errors.guestCount = "Guest count must be at least 1";
      } else if (data.eventType === "Table Reservation" && count > 4) {
        errors.guestCount = "Lounge tables accommodate up to 4 guests. For larger parties, book a Private Event takeover.";
      }
      
      const isOffsite = data.eventType === "Coffee Cart Booking" || data.eventType === "Private Event";
      if (isOffsite && !data.location?.trim()) {
        errors.location = "Venue address / location is required for offsite bookings";
      }
    } else if (step === 3) {
      if (!data.fullName?.trim()) errors.fullName = "Full name is required";
      
      if (!data.email?.trim()) {
        errors.email = "Email address is required";
      } else if (!/\S+@\S+\.\S+/.test(data.email)) {
        errors.email = "Please enter a valid email address";
      }
      
      if (!data.phone?.trim()) {
        errors.phone = "Phone number is required";
      }
    }

    return errors;
  }

  /**
   * Simulates booking submission to a remote database.
   */
  static async submitReservation(reservation: Reservation): Promise<{
    success: boolean;
    reference: string;
    message: string;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          reference: this.generateConfirmationCode(),
          message: "Your private experience request has been successfully registered. Our maître d' will contact you within 24 hours.",
        });
      }, 1500);
    });
  }
}
