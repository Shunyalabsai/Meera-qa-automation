# Appointment Reminder & Reschedule Agent — Full Journey

Test suite for the **Appointment Reminder & Reschedule** template card (Healthcare industry, outbound).

## Template pre-fill (from live UI)

| Field | Default |
|-------|---------|
| Card title | Appointment Reminder & Reschedule |
| Name | <appointment>-derived (asserted via regex) |
| Language | **hinglish** |
| Voice tone | **professional** |
| Accent | **indian** |
| Agent gender | **female** |
| Call direction | **outbound** |
| First message | `Hi! Kya main ${patient_name} ji se baat kar rahi hoon?` |
| Silence timeout | 10s · Max retries **2** · Max duration **600s** |
| Voicemail detection | can be enabled |
| Temperature / tokens | 0.7 / 300 |

## System prompt (pre-filled)

Healthcare appointment system prompt covering reminding patients and rescheduling (`/appointment|reschedule|remind|Healthcare/i`).

## Extraction fields (appointment-specific)

```json
{
  "appointmentConfirmed": "boolean: did the customer confirm attendance?",
  "rescheduleRequested": "boolean: did the customer ask to reschedule?",
  "newAppointmentDate": "new date if rescheduling was discussed"
}
```

## Test files

| File | Coverage |
|------|----------|
| `00-template.spec.ts` | Card + pre-fill (incl. call-direction default), Change template → Healthcare industry view |
| `01-prompt-tab.spec.ts` | Hinglish, professional, system prompt |
| `02-behaviour-tab.spec.ts` | First message, silence, barge-in |
| `03-recording-tab.spec.ts` | Record all calls |
| `04-outcomes-tab.spec.ts` | Appointment extraction, escalation |
| `05-advanced-tab.spec.ts` | Temperature, pre-call API |
| `06-validation.spec.ts` | Delete/clone cancel |
| `07-full-journey.spec.ts` | Single-shot create |
| `08-tabs-navigation.spec.ts` | All 5 tabs |
| `09-lifecycle.spec.ts` | Create → edit → clone → delete |

## Shared coverage

Also covered in `../templates/` for all cards:
- `prompt-dropdowns.spec.ts` — all dropdown options
- `edge-cases.spec.ts` — 22 negative/edge cases

## Run

```bash
npm run auth:save
npm run test:appointment-reminder-reschedule
npm run test:appointment-reminder-reschedule-lifecycle
```
