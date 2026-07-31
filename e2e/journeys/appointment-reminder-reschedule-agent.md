# Appointment Reminder Agent — Full Journey

Test suite for the **Appointment Reminder & Reschedule** template card.

## Template pre-fill (from UI screenshots)

| Field | Default |
|-------|---------|
| Name | Appointment Reminder Agent |
| Language | **hinglish** |
| Voice tone | **professional** |
| Accent | **indian** |
| Agent gender | **female** |
| First message | Hi! Kya main ${patient_name} ji se baat kar rahi hoon? |
| Silence timeout | 10 seconds |
| Max retries | 4 |
| Max call duration | 600 seconds |
| Barge-in | enabled |
| Temperature / tokens | 0.7 / 300 |

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
| `00-template.spec.ts` | Card selection, pre-fill |
| `01-prompt-tab.spec.ts` | en, professional, system prompt |
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
