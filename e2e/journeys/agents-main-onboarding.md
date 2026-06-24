# Agents Main Screen — New User Onboarding

Tests for the **Agents empty state** shown after first sign-up, before any agents exist. This screen precedes the template gallery at `/agents/new`.

## Flow

```
/agents (empty state)
├── Hero: "Build your first voice agent"
├── Step 1: Create an agent        → /agents/new
├── Step 2: Add a phone number   → /phone-numbers (RUN)
├── Step 3: Test in Playground   → /playground (BUILD)
└── CTA: "Create your first agent →" → /agents/new
```

## Screens covered

| Screen | Section | Route |
|--------|---------|-------|
| Agents main (empty) | BUILD | `/agents` |
| Phone numbers (empty) | RUN | `/phone-numbers` |
| Playground (no agent selected) | BUILD | `/playground` |

## Test files

| File | Coverage |
|------|----------|
| `onboarding/00-agents-main.spec.ts` | Empty state UI, 3 steps, CTA |
| `onboarding/01-step-navigation.spec.ts` | Step clicks → Phone numbers & Playground |

## Note on test data

These tests **skip automatically** when the saved auth user already has agents (list view instead of onboarding hero). Use a fresh account or delete all agents to run the full suite.

## Run

```bash
npm run auth:save
npm run test:agents-onboarding
```

## Related

- Sign-up journey: [new-user-signup.md](./new-user-signup.md)
- Agent creation (gallery): [agent-creation.md](./agent-creation.md)
