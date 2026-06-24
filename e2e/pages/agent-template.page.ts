import { Page, expect } from "@playwright/test";

/** Template gallery shown at /agents/new before the agent form. */
export const AGENT_TEMPLATES = [
  {
    id: "debt-recovery",
    title: "Debt recovery",
    description: "Call customers about overdue payments",
  },
  {
    id: "order-confirmation",
    title: "Order confirmation",
    description: "Confirm order details and delivery",
  },
  {
    id: "appointment-reminder",
    title: "Appointment reminder",
    description: "Remind customers about upcoming appointments",
  },
  {
    id: "customer-support",
    title: "Customer support",
    description: "Handle inbound support calls",
  },
] as const;

export type AgentTemplateTitle = (typeof AGENT_TEMPLATES)[number]["title"];

/** Every way to reach the agent form from /agents/new. */
export const TEMPLATE_FORM_ENTRIES = [
  ...AGENT_TEMPLATES.map((t) => ({
    id: t.id,
    label: t.title,
    kind: "template" as const,
    title: t.title,
  })),
  {
    id: "start-from-scratch",
    label: "Start from scratch",
    kind: "scratch" as const,
    title: null as null,
  },
] as const;

export type TemplateFormEntry = (typeof TEMPLATE_FORM_ENTRIES)[number];

export class AgentTemplatePage {
  constructor(private readonly page: Page) {}

  async expectGallery() {
    await expect(
      this.page.getByRole("heading", { name: /What are you building/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      this.page.getByText(/Pick a template to get started/i),
    ).toBeVisible();
  }

  async expectAllTemplateCards() {
    for (const t of AGENT_TEMPLATES) {
      await expect(this.page.getByText(t.title, { exact: false })).toBeVisible();
    }
    await expect(
      this.page.getByText(/Start from scratch/i),
    ).toBeVisible();
  }

  templateCard(title: string) {
    return this.page.getByRole("button", { name: new RegExp(title, "i") });
  }

  async waitForGalleryOrForm() {
    await expect(
      this.page
        .getByRole("heading", { name: /What are you building/i })
        .or(this.page.getByRole("tab", { name: "Prompt" })),
    ).toBeVisible({ timeout: 30_000 });
  }

  async selectTemplate(title: string) {
    await this.waitForGalleryOrForm();
    if (
      await this.page
        .getByRole("tab", { name: "Prompt" })
        .isVisible({ timeout: 1_000 })
        .catch(() => false)
    ) {
      return;
    }
    await this.expectGallery();
    await this.templateCard(title).click();
    await expect(
      this.page.getByRole("tab", { name: "Prompt" }),
    ).toBeVisible({ timeout: 30_000 });
  }

  async startFromScratch() {
    await this.waitForGalleryOrForm();
    if (
      await this.page
        .getByRole("tab", { name: "Prompt" })
        .isVisible({ timeout: 1_000 })
        .catch(() => false)
    ) {
      return;
    }
    await this.page.getByRole("button", { name: /Start from scratch/i }).click();
    await expect(
      this.page.getByRole("tab", { name: "Prompt" }),
    ).toBeVisible({ timeout: 30_000 });
  }
}
