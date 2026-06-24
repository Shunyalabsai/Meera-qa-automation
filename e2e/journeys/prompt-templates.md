# BUILD › Prompt Templates — New User Journey

Reusable system prompts with version history (`/prompts`).

## Screens

| Screen | Route | Key elements |
|--------|-------|--------------|
| Empty list | `/prompts` | "No prompt templates yet", **New template** |
| Create form | `/prompts` (inline/modal) | Name*, Category, Description, Base prompt*, variables |

## Create form fields

| Field | Required | Notes |
|-------|----------|-------|
| Name | Yes | e.g. `welcome-flow` |
| Category | No | e.g. `support` |
| Description | No | Short summary |
| Base prompt | Yes | Supports `{variable_name}` single-brace placeholders |
| Expected variables | No | **+ Add variable** → field_name, required, description |

## Test files

| File | Coverage |
|------|----------|
| `00-list-empty-state.spec.ts` | Empty list UI |
| `01-create-form-ui.spec.ts` | Form fields, guide, cancel |
| `02-expected-variables.spec.ts` | Add/remove variable rows |
| `03-create-positive.spec.ts` | Create with & without variables |
| `04-validation.spec.ts` | Empty name/prompt, XSS, unicode |
| `05-lifecycle.spec.ts` | Create → list → delete |

## Run

```bash
npm run auth:save
npm run test:prompt-templates
npm run test:prompt-templates-lifecycle
```

## Tags

- `@prompts` — all prompt template tests
- `@new-user` — new user journey
- `@negative` / `@edge` — validation spec
