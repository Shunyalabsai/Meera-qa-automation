# RUN › Campaigns — New User Journey

Outbound bulk calling at `/campaigns`.

## Screens

| Screen | Key elements |
|--------|--------------|
| Empty list | "No campaigns yet", **New campaign** |
| Create form | Agent*, Name*, Max concurrent (5), Description, Retry (2/60s), From number |

## From number empty state

When no phone numbers are configured:

> No phone numbers configured. **Add one in Phone Numbers.**

Link navigates to `/phone-numbers`.

## Test files

| File | Tag | Coverage |
|------|-----|----------|
| `00-list-empty-state.spec.ts` | `@ui` | Empty list, New campaign button |
| `01-create-form-ui.spec.ts` | `@positive` | Form fields, defaults, cancel |
| `02-phone-numbers-link.spec.ts` | `@positive` | Hyperlink → Phone numbers |
| `03-negative.spec.ts` | `@negative` | Missing agent/name, invalid numbers |
| `04-edge.spec.ts` | `@edge` | Cancel reset, long name, create flow |
| `campaigns.spec.ts` | `@smoke` | Page load |

## Run

```bash
npm run auth:save
npm run test:campaigns
npm run test:campaigns -- --grep @negative
npm run test:campaigns -- --grep @edge
```
