# RUN › Phone numbers — New User Journey

Register Plivo/Twilio numbers at `/phone-numbers`.

## Screens

| Screen | Key elements |
|--------|--------------|
| Empty list | "No phone numbers registered yet", **+ Add number** |
| Telephony accounts | **Telephony accounts (0)**, "No accounts yet..." |
| Add modal | Account (existing/new), Plivo/Twilio, Auth ID/token, Number |

## Add phone number modal

| Section | Fields |
|---------|--------|
| **Account** | Use existing / Set up new (default), Plivo/Twilio, Account label (optional), Auth ID, Auth token |
| **Number** | E.164 number (+12345550100), Label (optional) |
| **Actions** | Cancel, **Add number** |

## Test files

| File | Tag | Coverage |
|------|-----|----------|
| `00-list-empty-state.spec.ts` | `@ui` | Empty list, telephony accounts (0) |
| `01-add-number-modal.spec.ts` | `@positive` | Modal, Plivo/Twilio, labels, cancel |
| `02-negative.spec.ts` | `@negative` | Missing fields, invalid phone |
| `03-edge.spec.ts` | `@edge` | Provider toggle, form reset |
| `phone-numbers.spec.ts` | `@smoke` | Page load |

## Linked from Campaigns

Campaign create form → **Add one in Phone Numbers** → this page (`campaigns/02-phone-numbers-link.spec.ts`).

## Run

```bash
npm run auth:save
npm run test:phone-numbers
npm run test:phone-numbers -- --grep @negative
npm run test:phone-numbers -- --grep @edge
```
