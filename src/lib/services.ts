import electricalImg from "@/assets/service-electrical.jpg";
import plumbingImg from "@/assets/service-plumbing.jpg";
import carpenterImg from "@/assets/service-carpenter.jpg";
import roImg from "@/assets/service-ro.jpg";
import cleaningImg from "@/assets/service-cleaning.svg";

export type ServiceValue =
  | "Electrical"
  | "Plumbing"
  | "Carpenter"
  | "RO / Water Filter"
  | "Cleaning";

export interface Service {
  slug: string;
  value: ServiceValue;
  title: string;
  short: string;
  cta: string;
  image: string;
  items: string[];
}

export const services: Service[] = [
  {
    slug: "electrical",
    value: "Electrical",
    title: "Electrical Services",
    short: "Switches, fans, lights, MCB and household wiring work.",
    cta: "Request Electrical Service",
    image: electricalImg,
    items: [
      "Switch and socket repair",
      "Fan installation / repair",
      "Light installation",
      "MCB / electrical issues",
      "Wiring-related work",
      "Appliance electrical connections",
      "Other household electrical problems",
    ],
  },
  {
    slug: "plumbing",
    value: "Plumbing",
    title: "Plumbing Services",
    short: "Taps, leakages, bathroom and kitchen plumbing work.",
    cta: "Request Plumbing Service",
    image: plumbingImg,
    items: [
      "Tap repair",
      "Pipe leakage",
      "Bathroom plumbing",
      "Kitchen plumbing",
      "Drain blockage",
      "Water leakage",
      "Sanitary fitting",
      "Other plumbing problems",
    ],
  },
  {
    slug: "carpenter",
    value: "Carpenter",
    title: "Carpenter Services",
    short: "Furniture, doors, cabinets and fittings repair.",
    cta: "Request Carpenter Service",
    image: carpenterImg,
    items: [
      "Furniture repair",
      "Door repair",
      "Cabinet repair",
      "Shelf installation",
      "Furniture assembly",
      "Hinges and handles",
      "Other carpentry work",
    ],
  },
  {
    slug: "ro-service",
    value: "RO / Water Filter",
    title: "RO / Water Filter Services",
    short: "RO servicing, filter change, installation and repairs.",
    cta: "Request RO Service",
    image: roImg,
    items: [
      "RO servicing",
      "Filter replacement",
      "RO installation",
      "Water leakage",
      "Low water flow",
      "Water purifier troubleshooting",
      "Annual maintenance / service",
      "Other water purifier problems",
    ],
  },
  {
    slug: "cleaning",
    value: "Cleaning",
    title: "Bathroom & Kitchen Cleaning",
    short: "Deep cleaning for bathrooms, kitchens and household appliances.",
    cta: "Request Cleaning Service",
    image: cleaningImg,
    items: [
      "Bathroom deep cleaning",
      "Kitchen deep cleaning",
      "Bathroom + kitchen combo",
      "Wash basin / sink cleaning",
      "Toilet / commode cleaning",
      "Refrigerator cleaning",
      "Microwave / oven cleaning",
      "Chimney cleaning",
      "Other household cleaning work",
    ],
  },
];

export const serviceValues = services.map((s) => s.value);

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}

/** Nagpur localities we currently cover most often. Availability is confirmed on call. */
export const serviceAreas = [
  "Manish Nagar",
  "Dharampeth",
  "Sadar",
  "Pratap Nagar",
  "Trimurti Nagar",
  "Wardha Road",
  "Besa",
  "Beltarodi",
  "Mihan",
  "Hingna",
  "Wadi",
  "Nandanvan",
  "Jaripatka",
  "Koradi",
  "Kamptee Road",
];

export const howItWorks = [
  { title: "Request a Service", text: "Tell us what problem you have." },
  { title: "We Call You", text: "Our team contacts you to understand and confirm the requirement." },
  { title: "Technician Visit", text: "We assign the appropriate technician for the job." },
  { title: "Problem Solved", text: "The technician completes the work at your home." },
];

export const whyChooseUs = [
  { title: "Local Nagpur Service", text: "We work in Nagpur and nearby areas, so visits are easy to arrange." },
  { title: "Multiple Home Services", text: "Electrical, plumbing, carpentry and RO work handled by one team." },
  { title: "Easy Service Request", text: "Submit a request online in under a minute — no account needed." },
  { title: "Direct Phone Support", text: "You speak with our team directly to confirm the work." },
  { title: "Experienced Technicians", text: "Work is assigned to technicians familiar with the job type." },
  { title: "Convenient Home Visits", text: "Technicians come to your home at a mutually confirmed time." },
  { title: "Transparent Communication", text: "We confirm the problem and visit time before sending anyone." },
];

/**
 * PLACEHOLDER REVIEWS — these are sample entries, not real customer testimonials.
 * Replace the text and names with genuine reviews before publishing.
 */
export const placeholderReviews = [
  {
    name: "Customer name (placeholder)",
    area: "Manish Nagar",
    service: "Electrical",
    text: "Sample review text — replace this with a real customer review once you collect one.",
  },
  {
    name: "Customer name (placeholder)",
    area: "Trimurti Nagar",
    service: "Plumbing",
    text: "Sample review text — replace this with a real customer review once you collect one.",
  },
  {
    name: "Customer name (placeholder)",
    area: "Pratap Nagar",
    service: "RO / Water Filter",
    text: "Sample review text — replace this with a real customer review once you collect one.",
  },
];

export const faqs = [
  {
    q: "Do I need to create an account?",
    a: "No. You can request a service without creating an account.",
  },
  {
    q: "How do I book a service?",
    a: "Submit the service request form. Our team will call you to confirm the details and visit time.",
  },
  {
    q: "Do you provide services at home?",
    a: "Yes, we provide home maintenance services at your home within our service areas.",
  },
  {
    q: "Which areas of Nagpur do you cover?",
    a: "We currently serve selected areas of Nagpur. Contact us to confirm availability in your location.",
  },
  {
    q: "Can I upload a photo of the problem?",
    a: "Yes. You can optionally upload up to 5 photos when submitting a request.",
  },
  {
    q: "Is the appointment automatically confirmed?",
    a: "No. Your preferred date and time are requests only. Our team will call you to confirm.",
  },
];
