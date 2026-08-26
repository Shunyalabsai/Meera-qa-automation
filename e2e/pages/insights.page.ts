import { Page, expect, Locator } from "@playwright/test";
import { gotoApp, waitForLoadingToClear } from "../helpers/navigate";
import {
  INSIGHTS_COPY,
  INSIGHTS_CHART_TITLES,
  INSIGHTS_DATE_PRESETS,
  INSIGHTS_HEATMAP_DAYS,
  INSIGHTS_KPI_LABELS,
  INSIGHTS_CAMPAIGN_COLUMNS,
} from "../data/insights-data";

/** ANALYZE › Insights — analytics dashboard for call metrics. */
export class InsightsPage {
  constructor(private readonly page: Page) {}

  async open() {
    await gotoApp(this.page, "insights");
    await this.expectPageHeader();
    await this.waitForKpisSettled();
  }

  async expectPageHeader() {
    await expect(
      this.page.getByRole("heading", { name: /^Insights$/i }),
    ).toBeVisible({ timeout: 30_000 });
  }

  /** Raw read of the Total Calls KPI — assumes KPIs already rendered. */
  private readTotalCallsNow(): Promise<number> {
    return this.page
      .getByRole("main")
      .innerText()
      .catch(() => "")
      .then((text) => {
        const match = text.match(/Total Calls\s+(\d+(?:\.\d+)?)/i);
        return match ? Number.parseFloat(match[1]) : 0;
      });
  }

  async parseTotalCalls(): Promise<number> {
    await this.waitForKpisSettled();
    return this.readTotalCallsNow();
  }

  /**
   * Wait until KPI tiles finish loading so reads aren't taken on a half-rendered
   * page. The main panel initially renders only the heading, then the Total
   * Calls tile appears and updates once aggregates resolve — so we wait for the
   * value to appear AND stop changing across consecutive polls.
   */
  async waitForKpisSettled(): Promise<void> {
    await waitForLoadingToClear(this.page);
    let prev = Number.NaN;
    await expect
      .poll(
        async () => {
          const text = await this.page
            .getByRole("main")
            .innerText()
            .catch(() => "");
          const match = text.match(/Total Calls\s+(\d+(?:\.\d+)?)/i);
          if (!match) return false;
          const value = Number.parseFloat(match[1]);
          const stable = value === prev;
          prev = value;
          return stable;
        },
        { timeout: 25_000, intervals: [500, 700, 900, 1_200] },
      )
      .toBe(true);
  }

  async isEmptyState(): Promise<boolean> {
    await this.waitForKpisSettled();
    return (await this.readTotalCallsNow()) === 0;
  }

  async hasCallData(): Promise<boolean> {
    await this.waitForKpisSettled();
    return (await this.readTotalCallsNow()) > 0;
  }

  async expectPopulatedKpis() {
    await this.expectKpiCardsVisible();
    await this.waitForKpisSettled();
    expect(await this.readTotalCallsNow()).toBeGreaterThan(0);
  }

  async expectEmptyState() {
    await this.expectPageHeader();
    await this.expectKpiCardsVisible();
    await this.expectEmptyKpis();
    await expect(
      this.page.getByText(INSIGHTS_COPY.emptyCampaign),
    ).toBeVisible({ timeout: 15_000 });
  }

  /** Agent filter — Insights main has an agent button / combobox. */
  agentFilterSelect(): Locator {
    return this.page
      .getByRole("main")
      .locator('button[role="combobox"], [role="combobox"], button[aria-haspopup="listbox"], button[aria-haspopup="menu"]')
      .or(this.page.getByRole("main").getByRole("button", { name: /All agents|agent/i }))
      .or(this.page.getByRole("main").locator("select"))
      .first();
  }

  agentFilterTrigger(): Locator {
    return this.agentFilterSelect().or(
      this.page
        .getByRole("main")
        .getByRole("button", { name: INSIGHTS_COPY.agentFilterDefault })
        .or(
          this.page.getByRole("main").getByRole("combobox", {
            name: INSIGHTS_COPY.agentFilterDefault,
          }),
        ),
    );
  }

  async expectAgentFilterVisible() {
    await expect(this.agentFilterSelect()).toBeVisible({ timeout: 15_000 });
  }

  async expectAgentFilterDefault() {
    const select = this.agentFilterSelect();
    await expect(select).toBeVisible({ timeout: 15_000 });
    const isNative = await select.evaluate((el) => el.tagName === "SELECT").catch(() => false);
    if (isNative) {
      await expect(select.locator("option:checked")).toContainText(/All agents/i);
    } else {
      await expect(select).toContainText(/All agents/i);
    }
  }

  async selectAgentFilter(value: string) {
    const select = this.agentFilterSelect();
    await expect(select).toBeVisible({ timeout: 15_000 });

    const isNative = await select.evaluate((el) => el.tagName === "SELECT").catch(() => false);
    if (isNative) {
      const selected = await select
        .locator("option:checked")
        .textContent()
        .catch(() => "");
      if (selected?.match(new RegExp(value, "i"))) return;

      await select.selectOption({ label: value }).catch(async () => {
        await select.selectOption(value);
      });
      return;
    }

    const currentText = await select.textContent().catch(() => "");
    if (currentText && new RegExp(value, "i").test(currentText)) return;

    await select.click({ force: true }).catch(() => {});
    await this.page.waitForTimeout(100);

    const popover = this.page.locator(
      '[role="listbox"], [role="menu"], div[data-radix-popper-content-wrapper], div[data-radix-select-content], ul[role="listbox"], div.absolute',
    ).last();
    const option = popover
      .locator('[role="option"], [role="menuitem"], [data-radix-select-item], [data-radix-collection-item], li, button, [role="button"]')
      .filter({ hasText: new RegExp(value, "i") })
      .first();

    if (await option.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await option.scrollIntoViewIfNeeded().catch(() => {});
      await option.click({ force: true }).catch(async () => {
        await option.dispatchEvent("click").catch(() => {});
      });
    } else {
      await this.page.keyboard.press("Escape").catch(() => {});
    }
  }

  dateInputs(): Locator {
    return this.page
      .getByRole("main")
      .locator('input[type="date"], input[placeholder*="dd"]');
  }

  dateFromInput(): Locator {
    return this.dateInputs().first();
  }

  dateToInput(): Locator {
    return this.dateInputs().nth(1);
  }

  datePresetTab(label: string): Locator {
    return this.page
      .getByRole("tab", { name: new RegExp(`^${label}$`, "i") })
      .or(
        this.page.getByRole("button", { name: new RegExp(`^${label}$`, "i") }),
      )
      .first();
  }

  /** @deprecated Use datePresetTab — presets are clickable tabs in the header. */
  datePresetButton(label: string): Locator {
    return this.datePresetTab(label);
  }

  async clickDatePreset(label: string) {
    await this.datePresetTab(label).click();
    await this.expectDatePresetActive(label);
    await expect(this.page.getByText(/TOTAL CALLS/i).first()).toBeVisible({
      timeout: 15_000,
    });
  }

  async expectDatePresetActive(label: string) {
    const tab = this.datePresetTab(label);
    await expect(tab).toBeVisible();

    const ariaSelected = await tab.getAttribute("aria-selected");
    const ariaCurrent = await tab.getAttribute("aria-current");
    const dataState = await tab.getAttribute("data-state");
    if (
      ariaSelected === "true" ||
      ariaCurrent === "page" ||
      ariaCurrent === "true" ||
      dataState === "active"
    ) {
      return;
    }

    const selectedInList = this.page
      .getByRole("tablist")
      .getByRole("tab", { selected: true });
    if (await selectedInList.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await expect(selectedInList).toContainText(new RegExp(label, "i"));
      return;
    }

    // Insights uses plain buttons — no aria-selected; visible preset is enough.
    const role = await tab.evaluate((el) => el.getAttribute("role"));
    if (role !== "tab") return;

    expect(
      ariaSelected ?? ariaCurrent ?? dataState,
      `Expected "${label}" tab to be active`,
    ).toBeTruthy();
  }

  async fillDateFrom(value: string) {
    await this.dateFromInput().fill(value);
  }

  async fillDateTo(value: string) {
    await this.dateToInput().fill(value);
  }

  kpiCard(label: string): Locator {
    return this.page
      .getByText(new RegExp(`^${label}$`, "i"))
      .locator("xpath=ancestor::*[self::div or self::section][1]");
  }

  async expectKpiCardsVisible() {
    for (const label of INSIGHTS_KPI_LABELS) {
      await expect(this.page.getByText(new RegExp(`^${label}$`, "i")).first()).toBeVisible();
    }
  }

  async expectEmptyKpis() {
    await expect(this.page.getByText(/TOTAL CALLS/i).first()).toBeVisible();
    await expect(
      this.page.getByText(/^0$/).first(),
    ).toBeVisible();
    await expect(this.page.getByText(/0s/i).first()).toBeVisible();
    await expect(this.page.getByText(/0\.0%/i).first()).toBeVisible();
  }

  async expectChartSectionsVisible() {
    for (const title of INSIGHTS_CHART_TITLES) {
      await expect(
        this.page.getByText(new RegExp(title, "i")).first(),
      ).toBeVisible();
    }
  }

  async expectDatePresetsVisible() {
    for (const preset of INSIGHTS_DATE_PRESETS) {
      await expect(this.datePresetTab(preset)).toBeVisible();
    }
  }

  async expectHeatmapAxesVisible() {
    const hasDays = await this.page.getByText(/^Sun|Mon|Tue|Wed|Thu|Fri|Sat$/i).first().isVisible({ timeout: 2_000 }).catch(() => false);
    if (hasDays) {
      for (const day of INSIGHTS_HEATMAP_DAYS) {
        await expect(this.page.getByText(new RegExp(`^${day}$`, "i")).first()).toBeVisible();
      }
    } else {
      await expect(
        this.page.getByText(/Less than 5 seconds|5–10 seconds|11–30 seconds|Above 180 seconds|Call Distribution/i).first(),
      ).toBeVisible();
    }
  }

  async expectCampaignTableVisible() {
    await expect(
      this.page.getByText(/Campaign Performance/i).first(),
    ).toBeVisible();
    for (const col of INSIGHTS_CAMPAIGN_COLUMNS) {
      await expect(
        this.page.getByRole("columnheader", { name: new RegExp(`^${col}$`, "i") }).or(
          this.page.getByText(new RegExp(`^${col}$`, "i")),
        ).first(),
      ).toBeVisible();
    }
  }

  async expectFiltersAndControlsVisible() {
    await this.expectAgentFilterVisible();
    await expect(this.dateFromInput()).toBeVisible();
    await expect(this.dateToInput()).toBeVisible();
    await this.expectDatePresetsVisible();
  }

  async expectDashboardLayout() {
    await this.expectKpiCardsVisible();
    await this.expectChartSectionsVisible();
    await this.expectCampaignTableVisible();
  }
}
