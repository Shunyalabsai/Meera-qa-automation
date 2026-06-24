import { Page, expect } from "@playwright/test";
import { gotoApp } from "../helpers/navigate";

export class AgentsListPage {
  constructor(private readonly page: Page) {}

  async open() {
    await gotoApp(this.page, "agents");
    await expect(this.page.getByRole("heading", { name: "Agents" })).toBeVisible();
  }

  async clickNewAgent() {
    await this.page.getByRole("link", { name: /New agent/i }).click();
  }

  agentRow(name: string) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return this.page
      .locator("li")
      .filter({
        has: this.page.locator("span.font-medium", {
          hasText: new RegExp(`^${escaped}$`),
        }),
      })
      .first();
  }

  agentCard(name: string) {
    return this.agentRow(name);
  }

  async expectAgentVisible(name: string) {
    await expect(this.page.getByText(name, { exact: false })).toBeVisible({
      timeout: 30_000,
    });
  }

  async expectAgentNotVisible(name: string) {
    await expect(
      this.agentRow(name).getByText(name, { exact: false }),
    ).not.toBeVisible({ timeout: 15_000 });
  }

  async openAgent(name: string) {
    if (!name?.trim()) {
      throw new Error("openAgent requires a non-empty agent name");
    }

    const row = this.agentRow(name);
    await expect(row).toBeVisible({ timeout: 15_000 });

    const link = row.getByRole("link", { name: new RegExp(name, "i") });
    if (await link.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await link.click();
    } else {
      await row.locator("span.font-medium").filter({ hasText: name }).first().click();
    }

    await expect(this.page).toHaveURL(/\/agents\/[0-9a-f-]+$/, {
      timeout: 15_000,
    });
  }

  async expectAgentStatus(name: string, status: "draft" | "active" | "archived") {
    const row = this.agentRow(name);
    await expect(row.getByText(status, { exact: true })).toBeVisible();
  }

  async cloneAgent(name: string) {
    const row = this.agentRow(name);
    this.page.once("dialog", (d) => d.accept());
    await row.getByRole("button", { name: "Clone" }).click();
    await expect(this.page).toHaveURL(/\/agents\/[0-9a-f-]+$/);
  }

  async deleteAgent(name: string) {
    const row = this.agentRow(name);
    this.page.once("dialog", (d) => d.accept());
    await row.getByRole("button", { name: "Delete" }).click();
    await this.expectAgentNotVisible(name);
  }

  async cancelDeleteAgent(name: string) {
    const row = this.agentRow(name);
    this.page.once("dialog", (d) => d.dismiss());
    await row.getByRole("button", { name: "Delete" }).click();
    await this.expectAgentVisible(name);
  }
}
