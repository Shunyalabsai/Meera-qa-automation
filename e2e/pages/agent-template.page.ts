import { Page, expect } from "@playwright/test";
import { waitForLoadingToClear } from "../helpers/navigate";

/** Template gallery shown at /agents/new before the agent form. */
export const AGENT_TEMPLATES = [
  {
    id: "credit-card-payment-reminder",
    title: "Credit Card Payment Reminder",
    description: "Call customers about overdue payments",
    industry: "BFSI",
    agentCard: "Credit Card Payment Reminder Agent",
  },
  {
    id: "order-confirmation-reschedule",
    title: "Order Confirmation & Reschedule",
    description: "Confirm order details and delivery",
    industry: "Logistics",
    agentCard: "Order Confirmation & Reschedule Agent",
  },
  {
    id: "appointment-reminder-reschedule",
    title: "Appointment Reminder & Reschedule",
    description: "Remind customers about upcoming appointments",
    industry: "Healthcare",
    agentCard: "Appointment Reminder & Reschedule Agent (Hinglish)",
  },
  {
    id: "retention-call",
    title: "Retention Call",
    description: "Handle inbound support calls",
    industry: "Telecom",
    agentCard: "Retention Call Agent",
  },
] as const;

export type AgentTemplateTitle = (typeof AGENT_TEMPLATES)[number]["title"];

/** Maps template titles to the 2-step gallery (industry → agent card). */
const TEMPLATE_INDUSTRY_MAP: Record<string, { industry: string; agentCard: string }> =
  Object.fromEntries(
    AGENT_TEMPLATES.map((t) => [t.title, { industry: t.industry, agentCard: t.agentCard }]),
  );

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
      this.page.getByRole("heading", { name: /What industry are you building for/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      this.page.getByText(/Pick an industry to see real, ready-to-use example agents/i),
    ).toBeVisible();
  }

  async expectAllTemplateCards() {
    // New UI: industry-based gallery with 5 industry cards
    await expect(this.page.getByText(/BFSI/i)).toBeVisible();
    await expect(this.page.getByText(/Ecommerce/i)).toBeVisible();
    await expect(this.page.getByText(/Healthcare/i)).toBeVisible();
    await expect(this.page.getByText(/Logistics/i)).toBeVisible();
    await expect(this.page.getByText(/Telecom/i)).toBeVisible();
    await expect(
      this.page.getByText(/Start from scratch/i),
    ).toBeVisible();
  }

  templateCard(title: string) {
    return this.page.getByRole("button", { name: new RegExp(title, "i") });
  }

  industryCard(industry: string) {
    return this.page.getByRole("button", { name: new RegExp(industry, "i") }).first();
  }

  async selectIndustry(industry: string) {
    await this.industryCard(industry).click();
    await this.page.getByRole("button", { name: /← Back to industries/i }).waitFor({
      state: "visible",
      timeout: 10_000,
    });
  }

  async waitForGalleryOrForm() {
    await waitForLoadingToClear(this.page);
    await expect(
      this.page
        .getByRole("heading", { name: /What industry are you building for/i })
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

    // New 2-step gallery: industry → agent card
    const mapping = TEMPLATE_INDUSTRY_MAP[title];
    if (mapping) {
      await this.selectIndustry(mapping.industry);
      // Match on the first part of agentCard (strip parenthetical suffixes which
      // can interfere with Playwright's accessible-name regex matching).
      const agentPattern = mapping.agentCard.replace(/\s*\(.*\)\s*$/, "").trim();
      await this.page
        .getByRole("button", { name: new RegExp(agentPattern, "i") })
        .first()
        .click();
    } else {
      // Fallback: try to click the template title directly (old 1-step gallery)
      await this.templateCard(title).click();
    }

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
