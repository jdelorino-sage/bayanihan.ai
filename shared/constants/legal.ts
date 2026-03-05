export const COURT_TYPES = [
  "SC",
  "CA",
  "CTA",
  "Sandiganbayan",
  "RTC",
  "MTC",
] as const;

export const CASE_CATEGORIES = [
  "Criminal",
  "Civil",
  "Labor",
  "Tax",
  "Administrative",
  "Constitutional",
  "Commercial",
  "Special Proceedings",
] as const;

export const STATUTE_TYPES = [
  { code: "RA", label: "Republic Act" },
  { code: "PD", label: "Presidential Decree" },
  { code: "EO", label: "Executive Order" },
  { code: "AO", label: "Administrative Order" },
  { code: "BP", label: "Batas Pambansa" },
  { code: "CA", label: "Commonwealth Act" },
] as const;

export const NOTARIAL_ACT_TYPES = [
  { code: "acknowledgment", label: "Acknowledgment" },
  { code: "jurat", label: "Jurat" },
  { code: "oath", label: "Oath/Affirmation" },
  { code: "copy_cert", label: "Copy Certification" },
  { code: "signature_witnessing", label: "Signature Witnessing" },
] as const;

export const SUBSCRIPTION_TIERS = [
  { code: "free", label: "Free (Citizen)", pricePhp: 0, queriesPerDay: 5 },
  { code: "student", label: "Student", pricePhp: 499, queriesPerDay: 50 },
  { code: "professional", label: "Professional", pricePhp: 2499, queriesPerDay: 200 },
  { code: "firm", label: "Firm", pricePhp: 4999, queriesPerDay: -1 },
  { code: "enterprise", label: "Enterprise", pricePhp: -1, queriesPerDay: -1 },
] as const;

export const RATE_LIMITS = {
  free: { requestsPerMin: 30, queriesPerDay: 5 },
  student: { requestsPerMin: 60, queriesPerDay: 50 },
  professional: { requestsPerMin: 120, queriesPerDay: 200 },
  firm: { requestsPerMin: 300, queriesPerDay: -1 },
  enterprise: { requestsPerMin: -1, queriesPerDay: -1 },
} as const;
