/**
 * PLACEHOLDER BUSINESS DETAILS — replace these with the real business details.
 * Everything below is used across the whole site, so editing this one file
 * updates the header, footer, contact page and all call/WhatsApp buttons.
 */
export const business = {
  // PLACEHOLDER name — replace with the registered business name.
  name: "Nagpur Home Services",
  tagline: "Electrical • Plumbing • Carpenter • RO • Cleaning",
  city: "Nagpur",
  state: "Maharashtra",

  // PLACEHOLDER phone — replace with the real business number (digits only, with country code).
  phone: "+919000000000",
  phoneDisplay: "+91 90000 00000",

  // PLACEHOLDER WhatsApp number — usually the same as the phone number.
  whatsapp: "919000000000",

  // PLACEHOLDER email — replace with the business email.
  email: "hello@example.com",

  // PLACEHOLDER address — replace with the real office / workshop address.
  addressLine: "Office address to be added, Nagpur, Maharashtra",

  workingHours: [
    { days: "Monday – Saturday", hours: "9:00 AM – 8:00 PM" },
    { days: "Sunday", hours: "10:00 AM – 5:00 PM" },
  ],
} as const;

export const telHref = `tel:${business.phone}`;

export function whatsappHref(message = "Hi, I would like to request a home service in Nagpur.") {
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
}
