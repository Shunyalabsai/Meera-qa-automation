/**
 * Ground-truth of the 2-step template gallery at /agents/new.
 * Step 1: industry cards (BFSI, Ecommerce, Healthcare, Logistics, Telecom).
 * Step 2: per-industry example agent cards (title, language tag, description).
 * Verified against agents.shunyalabs.ai (2026-07).
 */

export type IndustryKey =
  | "BFSI"
  | "Ecommerce"
  | "Healthcare"
  | "Logistics"
  | "Telecom";

export type GalleryAgentCard = {
  title: string;
  /** Language tag shown on the card (Hindi / Hinglish / India English / US English). */
  language: string;
  description: RegExp;
};

export type IndustryGallery = {
  industry: IndustryKey;
  /** "N example agents" count shown on the industry card. */
  count: number;
  agentCards: GalleryAgentCard[];
};

export const INDUSTRIES: IndustryGallery[] = [
  {
    industry: "BFSI",
    count: 5,
    agentCards: [
      {
        title: "Fixed Deposit Payment Agent (Hindi)",
        language: "Hindi",
        description: /incomplete Fixed Deposit payment/i,
      },
      {
        title: "Video KYC Follow-up Agent",
        language: "Hinglish",
        description: /pending Video KYC step/i,
      },
      {
        title: "Personal Loan Eligibility Agent",
        language: "India English",
        description: /pending personal loan application/i,
      },
      {
        title: "Fixed Deposit Payment Agent",
        language: "India English",
        description: /incomplete Fixed Deposit payment/i,
      },
      {
        title: "Credit Card Payment Reminder Agent",
        language: "US English",
        description: /due credit card payment/i,
      },
    ],
  },
  {
    industry: "Ecommerce",
    count: 5,
    agentCards: [
      {
        title: "Cash on Delivery Confirmation Agent (ShopEase)",
        language: "Hindi",
        description: /cash-on-delivery order/i,
      },
      {
        title: "Exchange Request Agent (ShopEase)",
        language: "Hinglish",
        description: /product exchange request/i,
      },
      {
        title: "Cart Abandonment Recovery Agent India (GlowCart)",
        language: "India English",
        description: /abandoned cosmetics cart/i,
      },
      {
        title: "Return & Exchange Agent (GlowCart)",
        language: "US English",
        description: /product return\/exchange/i,
      },
      {
        title: "Cart Abandonment Recovery Agent (GlowCart)",
        language: "US English",
        description: /abandoned cart/i,
      },
    ],
  },
  {
    industry: "Healthcare",
    count: 6,
    agentCards: [
      {
        title: "Lab Test Report Follow-up Agent (Hindi)",
        language: "Hindi",
        description: /lab report is ready/i,
      },
      {
        title: "Hernia Surgery Lead Qualification Agent (Hindi)",
        language: "Hindi",
        description: /hernia surgery enquiry/i,
      },
      {
        title: "Appointment Reminder & Reschedule Agent (Hinglish)",
        language: "Hinglish",
        description: /upcoming appointment and reschedules/i,
      },
      {
        title: "Annual Health Check-up Reminder Agent",
        language: "India English",
        description: /annual health check-up/i,
      },
      {
        title: "Post-Discharge Follow-up Agent",
        language: "US English",
        description: /after hospital discharge/i,
      },
      {
        title: "Specialist Appointment Scheduling Agent",
        language: "US English",
        description: /specialist consultation appointment/i,
      },
    ],
  },
  {
    industry: "Logistics",
    count: 4,
    agentCards: [
      {
        title: "Delivery Address Confirmation Agent (Hindi)",
        language: "Hindi",
        description: /delivery address/i,
      },
      {
        title: "Order Confirmation & Reschedule Agent",
        language: "Hinglish",
        description: /confirms an order and reschedules delivery/i,
      },
      {
        title: "Delivery Delay Notification Agent",
        language: "India English",
        description: /delivery delay/i,
      },
      {
        title: "Missed Delivery Rescheduling Agent",
        language: "US English",
        description: /reschedules a missed package delivery/i,
      },
    ],
  },
  {
    industry: "Telecom",
    count: 4,
    agentCards: [
      {
        title: "Broadband Installation Scheduling Agent (Hindi)",
        language: "Hindi",
        description: /broadband installation appointment/i,
      },
      {
        title: "Network Issue Follow-up Agent (Hinglish)",
        language: "Hinglish",
        description: /network connectivity issue/i,
      },
      {
        title: "Data Pack Renewal Reminder Agent",
        language: "India English",
        description: /data plan is expiring/i,
      },
      {
        title: "Retention Call Agent",
        language: "US English",
        description: /service cancellation/i,
      },
    ],
  },
];

export const TOTAL_GALLERY_AGENTS = INDUSTRIES.reduce(
  (sum, i) => sum + i.count,
  0,
);

export function galleryForIndustry(industry: IndustryKey): IndustryGallery {
  const found = INDUSTRIES.find((i) => i.industry === industry);
  if (!found) throw new Error(`Unknown industry: ${industry}`);
  return found;
}
