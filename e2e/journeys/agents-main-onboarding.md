# Agents Main Screen — Get-Started Onboarding

Tests for the **"Get started" onboarding checklist** shown on the Agents dashboard at `/agents` (new user; card also persists while the checklist is incomplete). The card precedes the template gallery at `/agents/new`.

## Flow

```
/agents
└── "Get started" card
    ├── Heading: "Get started"
    ├── Subtitle: "Complete these steps to run your first call."
    ├── Step 1: Create an agent       → /agents (done) | /agents/new (todo)
    ├── Step 2: Test in Playground    → /playground (BUILD)
    ├── Step 3: Add a phone number    → /phone-numbers (RUN)
    ├── Step 4: Run a campaign        → /campaigns (RUN)
    └── CTA: "New agent"              → /agents/new
```

## Screens covered

| Screen | Section | Route |
|--------|---------|-------|
| Agents main (Get-started card) | BUILD | `/agents` |
| Phone numbers (empty) | RUN | `/phone-numbers` |
| Playground (no agent selected) | BUILD | `/playground` |
| Campaigns (empty) | RUN | `/campaigns` |

## Test files

| File | Coverage |
|------|----------|
| `onboarding/00-agents-main.spec.ts` | Get-started card UI, 4 steps, New agent CTA |
| `onboarding/01-step-navigation.spec.ts` | Step clicks → Playground, Phone numbers, Campaigns |
| `onboarding/02-validation.spec.ts` | Edge cases + accessible step links |

## Note on test data

These tests **skip automatically** when the "Get started" card is not shown on `/agents` (e.g. dismissed or checklist complete). The card renders independently of agent count, so a saved-auth user with existing agents still exercises the checklist.

## Run

```bash
npm run auth:save
npm run test:agents-onboarding
```

## Related

- Sign-up journey: [new-user-signup.md](./new-user-signup.md)
- Agent creation (gallery): [agent-creation.md](./agent-creation.md)
