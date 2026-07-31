/** Expected defaults when selecting the Order Confirmation & Reschedule Agent (Logistics). */

export const ORDER_CONFIRMATION_RESCHEDULE_TEMPLATE = {
  cardTitle: "Order Confirmation & Reschedule",
  cardDescription: /order|reschedule|confirms/i,
  expectedName: /order confirmation/i,
  expectedLanguage: "hinglish",
  expectedVoiceTone: "professional",
  expectedAccent: "indian",
  expectedGender: "female",
  expectedSystemPromptSnippet: /order|confirms|reschedule|Logistics/i,
  expectedFirstMessageSnippet: /baat kar rahi|order|confirm|reschedule/i,
  defaultExtractionFields: ["buyingIntent", "orderConfirmed", "updatedAddress"],
  defaultFirstMessage:
    "Hi! Kya main ${customer_name} ji se baat kar rahi hoon?",
  defaultSilenceTimeoutSecs: 10,
  defaultIdleMaxRetries: 2,
  defaultMaxCallDurationSecs: 600,
  defaultCallDirection: "outbound",
} as const;
