# BUILD › Playground — New User Journey

Test voice agents via **Browser** (mic) or **Phone Call** (Plivo outbound) at `/playground`.

## UI from screenshots

| Area | Browser mode | Phone Call mode |
|------|--------------|-----------------|
| Agent | Dropdown — "Pick an agent..." | Same |
| Toggle | **Browser** (default) | **Phone Call** |
| Action | **Start call** | **Start Phone Call** |
| Details | PCM 16 kHz mic stream | From number, To number (+91), Context variables |
| Log | idle / No activity yet | Same |

## Test files

| File | Tag | Coverage |
|------|-----|----------|
| `00-main-ui.spec.ts` | `@ui` `@positive` | Header, agent picker, toggle, idle log |
| `01-browser-mode.spec.ts` | `@positive` | Browser panel, agent select, Start call |
| `02-phone-mode.spec.ts` | `@positive` | Plivo panel, from/to, context JSON |
| `03-negative.spec.ts` | `@negative` | No agent, bad phone, bad JSON, TC-VC-101 |
| `04-edge.spec.ts` | `@edge` | Mode toggle persistence, invalid deep-link |
| `playground.spec.ts` | `@smoke` | Quick smoke |

## Manual (live voice)

TC-VC-002–006, 010, 102–105 require live mic/telephony — tagged `@manual` in specs.

## Run

```bash
npm run auth:save
npm run test:playground
npm run test:playground -- --grep @negative
npm run test:playground -- --grep @edge
```

## Related

- Agents onboarding step 3 → Playground: `agents/onboarding/01-step-navigation.spec.ts`
- Coverage matrix: [../COVERAGE.md](../COVERAGE.md)
