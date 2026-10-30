import { z } from "zod";

/**
 * Validation schema for user signup (/api/auth/signup)
 */
export const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("A valid email address is required.")
    .max(255, "Email is too long."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(72, "Password is too long."),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name is too long."),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be at most 30 characters.")
    .regex(
      /^[a-z0-9_.-]+$/,
      "Username may only contain letters, numbers, underscores, dashes, or dots."
    ),
});

/**
 * Validation schema for forgot password request (/api/auth/forgot-password)
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("A valid email address is required.")
    .max(255, "Email is too long."),
});

/**
 * Validation schema for creating a new reservation (/api/reservations - POST)
 */
export const createReservationSchema = z.object({
  id: z.string().trim().max(60).optional(),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required.")
    .max(120, "Full name cannot exceed 120 characters."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("A valid email address is required.")
    .max(255),
  phone: z
    .string()
    .trim()
    .min(7, "A valid contact phone number is required.")
    .max(25, "Phone number is too long."),
  eventType: z.enum(["Table Reservation", "Coffee Cart Booking"], {
    message: "Event type must be either 'Table Reservation' or 'Coffee Cart Booking'.",
  }),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must follow YYYY-MM-DD format."),
  time: z
    .string()
    .trim()
    .min(1, "Reservation time is required.")
    .max(20),
  guestCount: z
    .number({ message: "Guest count must be a number." })
    .int("Guest count must be an integer.")
    .min(1, "Guest count must be at least 1.")
    .max(1000, "Guest count cannot exceed 1,000."),
  location: z
    .string()
    .trim()
    .min(2, "Location is required.")
    .max(300, "Location cannot exceed 300 characters."),
  notes: z.string().trim().max(1000).optional().nullable(),
  paymentMethod: z.string().trim().max(50).optional().nullable(),
  referenceNumber: z.string().trim().max(100).optional().nullable(),
  proofOfPayment: z.string().trim().max(2000).optional().nullable(),
  coffeeFlavor1: z.string().trim().max(100).optional().nullable(),
  coffeeFlavor2: z.string().trim().max(100).optional().nullable(),
  nonCoffeeFlavor1: z.string().trim().max(100).optional().nullable(),
  nonCoffeeFlavor2: z.string().trim().max(100).optional().nullable(),
  transpoFee: z.number().min(0).max(100000).optional(),
  distanceKm: z.number().min(0).max(1000).optional(),
});

/**
 * Validation schema for updating a reservation (/api/reservations/[id] - PATCH)
 */
export const patchReservationSchema = z.object({
  status: z
    .enum([
      "Pending",
      "Pre-Approved",
      "Approved",
      "Cancelled",
      "Completed",
      "Cancellation Requested",
    ])
    .optional(),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  time: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(1000).optional().nullable(),
  paymentMethod: z.string().trim().max(50).optional().nullable(),
  referenceNumber: z.string().trim().max(100).optional().nullable(),
  proofOfPayment: z.string().trim().max(2000).optional().nullable(),
  cancellationReason: z.string().trim().max(500).optional().nullable(),
  discountAmount: z.number().min(0).max(1000000).optional(),
  discountReason: z.string().trim().max(255).optional().nullable(),
  isFreeTranspoFee: z.boolean().optional(),
  customDownpayment: z.number().min(0).max(1000000).optional().nullable(),
  transpoFee: z.number().min(0).max(100000).optional(),
  // Client verification fields for guest actions
  clientEmail: z.string().trim().email().optional(),
  clientPhone: z.string().trim().optional(),
});

/**
 * Validation schema for loyalty points/stamps adjustment (/api/loyalty - PATCH)
 */
export const patchLoyaltySchema = z
  .object({
    cardId: z.string().trim().optional(),
    userId: z.string().trim().optional(),
    stamps: z.number().int().min(0).max(100).optional(),
    points: z.number().int().min(0).max(1000000).optional(),
  })
  .refine((data) => data.cardId || data.userId, {
    message: "Either cardId or userId is required.",
  });

/**
 * Validation schema for user role change (/api/users/role - POST)
 */
export const changeUserRoleSchema = z.object({
  userId: z.string().trim().min(1, "userId is required."),
  newRole: z.enum(["admin", "barista", "customer"], {
    message: "Invalid role specified. Must be 'admin', 'barista', or 'customer'.",
  }),
});

/**
 * Validation schema for menu category creation (/api/menu/categories - POST)
 */
export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name cannot be empty.")
    .max(80, "Category name cannot exceed 80 characters."),
});
