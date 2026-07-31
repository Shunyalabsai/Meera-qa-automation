/** Expected defaults when selecting the Appointment Reminder & Reschedule Agent (Hinglish) — Healthcare. */

export const APPOINTMENT_REMINDER_RESCHEDULE_TEMPLATE = {
  cardTitle: "Appointment Reminder & Reschedule",
  cardDescription: /appointment|reschedule|remind/i,
  expectedName: /appointment/i,
  expectedLanguage: "hinglish",
  expectedVoiceTone: "professional",
  expectedAccent: "indian",
  expectedGender: "female",
  expectedSystemPromptSnippet: /appointment|reschedule|remind|Healthcare/i,
  expectedFirstMessageSnippet: /baat kar rahi|appointment|remind/i,
  defaultFirstMessage:
    "Hi {{customerName}}, I'm calling to remind you about your appointment on {{appointmentDate}}. Can you confirm you'll be attending?",
  defaultSilenceTimeoutSecs: 10,
  defaultIdleMaxRetries: 4,
  defaultMaxCallDurationSecs: 600,
  defaultExtractionFields: [
    "appointmentConfirmed",
    "rescheduleRequested",
    "newAppointmentDate",
  ],
} as const;
