# Global › Language Switcher — New User Journey

Google Translate–powered UI localization via the sidebar trigger (globe + language name + code).

## Trigger (default)

| Element | Value |
|---------|-------|
| Label | English |
| Code | EN |
| Chevron | Rotates when open |

## Dropdown panel

| Element | Detail |
|---------|--------|
| Search | `Search language...` |
| Groups | International, Hindi Belt, South India, West India, East India, North-East, North India |
| Active | Blue highlight + checkmark |
| Empty search | `No results` |
| Close | Backdrop click or Escape |

## Languages (35 total)

### International (14)

English, Japanese, Chinese (Simplified), Chinese (Traditional), Arabic, German, French, Spanish, Portuguese, Russian, Korean, Turkish, Vietnamese, Indonesian

### Hindi Belt (4)

Hindi, Bhojpuri, Maithili, Rajasthani

### South India (4)

Tamil, Telugu, Kannada, Malayalam

### West India (3)

Marathi, Gujarati, Konkani

### East India (3)

Bengali, Odia, Assamese

### North-East (2)

Meitei, Nepali

### North India (5)

Punjabi, Urdu, Kashmiri, Dogri, Sindhi

## Persistence

- `localStorage.shunya_lang` stores selected code
- Non-English triggers Google Translate via hidden `select.goog-te-combo`

## Test files

| File | Tag | Coverage |
|------|-----|----------|
| `00-main-ui.spec.ts` | `@ui` | Trigger, panel, groups, active English, hidden GT element |
| `01-languages-positive.spec.ts` | `@positive` | All 35 languages listed; selection updates trigger + storage |
| `02-search-positive.spec.ts` | `@positive` `@negative` | Filter, no results, clear, restore English |
| `03-edge.spec.ts` | `@edge` | Escape, backdrop, nav, reload, mobile, scroll, Webhooks route |
| `04-cta-functional.spec.ts` | `@cta` | Open, search, select, close CTAs |
| `language.spec.ts` | `@smoke` | TC-LG-001 panel opens with English active |

## Manual

- TC-LG-013 — Google Translate applies page strings
- TC-LG-E110 — `goog-te-combo` loads after selection
- TC-EC-008 — RTL layout for Urdu/Arabic

## Run

```bash
npm run auth:save
npm run test:language
npm run test:language -- --grep @negative
npm run test:language -- --grep @edge
npm run test:language -- --grep @cta
```
