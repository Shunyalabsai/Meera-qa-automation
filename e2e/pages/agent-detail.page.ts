import { Page, expect } from "@playwright/test";
import { gotoApp } from "../helpers/navigate";
import { AgentsListPage } from "./agents-list.page";

export class AgentDetailPage {
  constructor(private readonly page: Page) {}

  async open(agentId: string, agentName?: string) {
    if (!agentId) {
      throw new Error("agentId is required to open agent detail");
    }

    await gotoApp(this.page, `agents/${agentId}`);

    const onDetail = await this.page
      .waitForURL(new RegExp(`/agents/${agentId}$`), { timeout: 10_000 })
      .then(() => true)
      .catch(() => false);

    if (!onDetail && agentName) {
      const agents = new AgentsListPage(this.page);
      await agents.open();
      await agents.openAgent(agentName);
    }

    await expect(this.page).toHaveURL(new RegExp(`/agents/${agentId}$`), {
      timeout: 30_000,
    });
  }

  async expectAgentName(name: string) {
    await expect(
      this.page
        .getByRole("main")
        .getByRole("heading", { name: new RegExp(name, "i") }),
    ).toBeVisible({ timeout: 15_000 });
  }

  async expectSetting(label: RegExp | string, value: RegExp | string) {
    const pattern =
      typeof label === "string" ? new RegExp(label, "i") : label;
    await expect(this.page.getByText(pattern).first()).toBeVisible();
    if (typeof value === "string") {
      await expect(this.page.getByText(value, { exact: false })).toBeVisible();
    }
  }

  async expectSystemPromptContains(text: RegExp | string) {
    const pattern = typeof text === "string" ? new RegExp(text, "i") : text;
    const main = this.page.getByRole("main");
    await expect(main.getByRole("heading", { name: /^System prompt$/i })).toBeVisible();
    await expect(main.getByText(pattern).first()).toBeVisible({ timeout: 10_000 });
  }

  async clickEdit() {
    await this.page.getByRole("link", { name: /^Edit$/i }).click();
    await expect(this.page).toHaveURL(/\/agents\/[0-9a-f-]+\/edit/, {
      timeout: 15_000,
    });
  }

  async clickPlayground() {
    await this.page.getByRole("link", { name: /Playground/i }).click();
    await expect(this.page).toHaveURL(/\/playground/, { timeout: 15_000 });
  }
}
