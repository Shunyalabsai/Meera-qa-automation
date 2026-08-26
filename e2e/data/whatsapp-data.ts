/** SETTINGS / CHANNELS › WhatsApp — copy, mock data, sample payloads, and validation fixtures. */

export const WHATSAPP_COPY = {
  header: /WhatsApp/i,
  subtitle: /Configure WhatsApp Business API, automated messaging, and post-call notifications/i,
  connectHeading: /Connect WhatsApp Business Account/i,
  templatesHeading: /Message Templates/i,
  testMessageHeading: /Send Test Message/i,
  webhookHeading: /WhatsApp Webhook Configuration/i,
  statusConnected: /Connected|Active/i,
  statusDisconnected: /Disconnected|Not configured/i,
  statusPending: /Pending verification/i,
  emptyTemplates: /No message templates found/i,
  testSuccessToast: /Test message sent successfully/i,
  saveSuccessToast: /WhatsApp settings saved successfully/i,
  phonePlaceholder: /^\+?[1-9]\d{1,14}$/,
} as const;

export const WHATSAPP_MESSAGE_TYPES = [
  "template",
  "text",
  "interactive",
  "media",
] as const;

export const WHATSAPP_WEBHOOK_EVENTS = [
  "whatsapp.message.received",
  "whatsapp.message.sent",
  "whatsapp.message.delivered",
  "whatsapp.message.read",
  "whatsapp.message.failed",
  "whatsapp.template.status_update",
] as const;

export const WHATSAPP_SAMPLES = {
  wabaId: "109847293847562",
  phoneNumberId: "104928374619284",
  displayPhoneNumber: "+1 555 019 2834",
  validE164Phone: "+15550192834",
  invalidPhone: "12345",
  nonE164Phone: "001-555-01928",
  accessToken: "EAAJ...mock_valid_waba_access_token_secure_min_32_chars_long",
  shortToken: "token_short",
  webhookVerifyToken: "shunya_whatsapp_verify_token_secure_2026",
  webhookCallbackUrl: "https://meera.shunyalabs.ai/api/v1/webhooks/whatsapp",
  invalidWebhookUrl: "http://invalid-url",
  templateName: "appointment_reminder_v1",
  templateLanguage: "en_US",
  testRecipientPhone: "+15550199999",
  sampleMessageBody: "Hello, this is an automated confirmation for your upcoming voice agent appointment.",
  unicodeMessageBody: "नमस्ते! आपकी अपॉइंटमेंट की पुष्टि हो गई है। 🚀",
  longMessageBody: "This is a detailed automated message from Meera VAP platform testing message payload limits. ".repeat(20),
} as const;

export const WHATSAPP_DEFAULT_TEMPLATES = [
  {
    name: "appointment_reminder_v1",
    category: "UTILITY",
    language: "en_US",
    status: "APPROVED",
  },
  {
    name: "order_status_update",
    category: "UTILITY",
    language: "en_US",
    status: "APPROVED",
  },
  {
    name: "payment_confirmation",
    category: "TRANSACTIONAL",
    language: "en_US",
    status: "APPROVED",
  },
] as const;
