export const TAX_RATE = 0.08875; // NYC local sales tax (8.875%)
export const FREE_SHIPPING_THRESHOLD = 75.0; // Spend $75 for free delivery
export const DEFAULT_SHIPPING_COST = 8.5; // Default shipping rate

export const PROMO_CODES = {
  GOLD15: 0.15, // 15% discount
  NOIR10: 0.10, // 10% discount
};

export const SALON_LOCATIONS = [
  {
    id: "loc-new-york",
    name: "L'OR NOIR Brooklyn",
    address: "55 Water St, Brooklyn, NY 11201",
    hours: "Mon - Fri: 7:00 AM - 8:00 PM | Sat - Sun: 8:00 AM - 10:00 PM",
    phone: "+1 (718) 555-0192",
    coordinates: "40.7032° N, 73.9926° W",
  },
  {
    id: "loc-tokyo",
    name: "L'OR NOIR Aoyama",
    address: "5-10-1 Minami-Aoyama, Minato-ku, Tokyo 107-0062",
    hours: "Daily: 9:00 AM - 9:00 PM",
    phone: "+81 3-5555-0143",
    coordinates: "35.6622° N, 139.7164° E",
  },
  {
    id: "loc-paris",
    name: "L'OR NOIR Marais",
    address: "24 Rue de Sévigné, 75004 Paris",
    hours: "Daily: 8:30 AM - 8:30 PM",
    phone: "+33 1 55 55 01 78",
    coordinates: "48.8566° N, 2.3522° E",
  },
  {
    id: "loc-seoul",
    name: "L'OR NOIR Gangnam",
    address: "420 Teheran-ro, Gangnam-gu, Seoul 06193",
    hours: "Mon - Sat: 8:00 AM - 10:00 PM | Sun: 9:00 AM - 9:00 PM",
    phone: "+82 2-555-0129",
    coordinates: "37.5043° N, 127.0496° E",
  },
];
