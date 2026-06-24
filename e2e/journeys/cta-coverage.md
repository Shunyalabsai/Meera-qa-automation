# Dashboard CTA Coverage

Every primary button, link, tab, and submit action across the VAP dashboard has dedicated **`@cta`** functional tests.

## Tag

```bash
npm run test:cta          # all CTA functional tests
npm run test:cta-audit    # verify each section has a *cta* spec file
```

## Per-section CTA specs

| Section | File | Key CTAs covered |
|---------|------|------------------|
| BUILD › Agents | `agents/05-list-detail-ctas.spec.ts`, `templates/cta-outcomes.spec.ts` | New agent, Edit, Playground, Clone, Customise/Add outcome |
| BUILD › Prompts | `prompts/07-cta-functional.spec.ts` | New template, Add variable, Cancel |
| BUILD › Playground | `playground/05-cta-functional.spec.ts` | Browser/Phone toggle, Start call, Start Phone Call |
| RUN › Campaigns | `campaigns/05-cta-functional.spec.ts` | New campaign, Phone numbers link, Cancel |
| RUN › Phone numbers | `phone-numbers/04-cta-functional.spec.ts` | Add number, Cancel, Plivo/Twilio |
| RUN › Live Calls | `live-calls/04-cta-functional.spec.ts` | Playground links |
| ANALYZE › Calls | `calls/05-cta-functional.spec.ts` | Go, Export, filters |
| ANALYZE › Recordings | `recordings/05-cta-functional.spec.ts` | Search, agent filter |
| ANALYZE › Insights | `insights/05-cta-functional.spec.ts` | All date tabs, agent filter |
| SETTINGS › Alerts | `alerts/05-lifecycle.spec.ts`, `06-cta-functional.spec.ts` | New rule, Create rule, Add/Save channel, tabs, Cancel |
| SETTINGS › Billing | `billing/05-cta-functional.spec.ts` | Sidebar link, time range dropdown, day/week/month tabs |
| SETTINGS › Webhooks | `webhooks/05-cta-functional.spec.ts` | Select all, Clear, Apply, Subscribe, Save subscription, Cancel, custom event link, Create, sidebar |
| Global › Language | `global/language/04-cta-functional.spec.ts` | Trigger, Search, Select language, Backdrop, Escape |

## Registry

All CTAs are listed in `e2e/data/cta-registry.ts`.

## Manual-only CTAs

These require telephony, external credentials, or security infra:

- Live call row monitor
- Recording play/download
- Real Plivo/Twilio Add number submit
- Webhook test event with live endpoint
- API key Revoke after generation
- Export calls when staging has no data

Each has `@manual` or conditional skip with reason.
