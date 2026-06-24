/** Expected defaults when selecting the Appointment reminder template card. */

export const APPOINTMENT_REMINDER_TEMPLATE = {
  cardTitle: "Appointment reminder",
  cardDescription: /upcoming appointments|confirm attendance/i,
  expectedName: /appointment reminder/i,
  expectedLanguage: "en",
  expectedVoiceTone: "professional",
  expectedAccent: "neutral",
  expectedGender: "neutral",
  expectedSystemPromptSnippet: /appointment reminder|upcoming appointment|reschedule|respectful/i,
  expectedFirstMessageSnippet: /appointment|appointmentDate|attending/i,
  defaultFirstMessage:
    "Hi {{customerName}}, I'm calling to remind you about your appointment on {{appointmentDate}}. Can you confirm you'll be attending?",
  defaultSilenceTimeoutSecs: 10,
  defaultIdleMaxRetries: 4,
  defaultMaxCallDurationSecs: 1800,
  defaultExtractionFields: [
    "appointmentConfirmed",
    "rescheduleRequested",
    "newAppointmentDate",
  ],
} as const;
