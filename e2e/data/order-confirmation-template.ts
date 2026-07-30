/** Expected defaults when selecting the Order Confirmation & Reschedule Agent (Logistics). */
// Maps from old "Order confirmation" template to new Logistics → Order Confirmation & Reschedule Agent.

export const ORDER_CONFIRMATION_TEMPLATE = {
  cardTitle: "Order confirmation",
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
    "Hi {{customerName}}, I'm calling to confirm your recent order with {{brand}}. Do you have a moment?",
} as const;
