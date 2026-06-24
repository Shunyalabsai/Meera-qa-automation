/** Expected defaults when selecting the Order confirmation template card. */

export const ORDER_CONFIRMATION_TEMPLATE = {
  cardTitle: "Order confirmation",
  cardDescription: /order details|delivery|confirm order/i,
  expectedName: /order confirmation/i,
  expectedLanguage: "hinglish",
  expectedVoiceTone: "warm",
  expectedAccent: "neutral",
  expectedGender: "neutral",
  expectedSystemPromptSnippet: /order confirmation|confirm.*order|warm|helpful/i,
  expectedFirstMessageSnippet: /confirm your recent order|customerName|brand/i,
  defaultExtractionFields: ["buyingIntent", "orderConfirmed", "updatedAddress"],
  defaultFirstMessage:
    "Hi {{customerName}}, I'm calling to confirm your recent order with {{brand}}. Do you have a moment?",
} as const;
