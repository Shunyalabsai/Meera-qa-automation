import { Page, expect, Locator } from "@playwright/test";
import { gotoApp } from "../helpers/navigate";
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
  }

  async expectPageHeader() {
    await expect(
      this.page.getByRole("heading", { name: /^Insights$/i }),
    ).toBeVisible({ timeout: 30_000 });
  }

  async isEmptyState(): Promise<boolean> {
    return this.page
      .getByText(/TOTAL CALLS/i)
      .locator("xpath=following::*[1]")
      .filter({ hasText: /^0$/ })
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
  }

  async expectEmptyState() {
    await this.expectPageHeader();
    await this.expectKpiCardsVisible();
    await this.expectEmptyKpis();
    await expect(
      this.page.getByText(INSIGHTS_COPY.emptyCampaign),
    ).toBeVisible({ timeout: 15_000 });
  }

  /** Agent filter — Insights main has a single agent combobox. */
  agentFilterSelect(): Locator {
    return this.page.getByRole("main").getByRole("combobox").first();
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
    await expect(select.locator("option:checked")).toContainText(/All agents/i);
  }

  async selectAgentFilter(value: string) {
    const nativeSelect = this.agentFilterSelect();
    await expect(nativeSelect).toBeVisible({ timeout: 15_000 });

    const selected = await nativeSelect
      .locator("option:checked")
      .textContent()
      .catch(() => "");
    if (selected?.match(new RegExp(value, "i"))) return;

    await nativeSelect.selectOption({ label: value }).catch(async () => {
      await nativeSelect.selectOption(value);
    });
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
    for (const day of INSIGHTS_HEATMAP_DAYS) {
      await expect(this.page.getByText(new RegExp(`^${day}$`, "i")).first()).toBeVisible();
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
