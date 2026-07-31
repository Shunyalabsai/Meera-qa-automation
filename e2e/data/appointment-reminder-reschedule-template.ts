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
    "Hi! Kya main ${patient_name} ji se baat kar rahi hoon?",
  defaultSilenceTimeoutSecs: 10,
  defaultIdleMaxRetries: 2,
  defaultMaxCallDurationSecs: 600,
  defaultCallDirection: "outbound",
  defaultExtractionFields: [
    "appointmentConfirmed",
    "rescheduleRequested",
    "newAppointmentDate",
  ],
} as const;
