import { Page, expect, Locator } from "@playwright/test";
import { gotoApp } from "../helpers/navigate";
import { CAMPAIGN_DEFAULTS } from "../data/campaign-data";

/** RUN › Campaigns — outbound bulk calling. */
export class CampaignsPage {
  constructor(private readonly page: Page) {}

  async open() {
    await gotoApp(this.page, "campaigns");
    await this.expectListHeader();
  }

  async expectListHeader() {
    await expect(
      this.page.getByRole("heading", { name: /^Campaigns$/i }).first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      this.page
        .getByText(/Outbound bulk calling|upload contacts|run dispatch/i)
        .first(),
    ).toBeVisible();
  }

  async isEmptyState(): Promise<boolean> {
    return this.page
      .getByText(/No campaigns yet/i)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
  }

  async expectEmptyState() {
    await this.expectListHeader();
    await expect(this.page.getByText(/No campaigns yet/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(this.newCampaignButton()).toBeVisible();
  }

  newCampaignButton(): Locator {
    return this.page.getByRole("button", { name: /New campaign/i });
  }

  async clickNewCampaign() {
    await this.newCampaignButton().click();
    await this.expectCreateForm();
  }

  async expectCreateForm() {
    await expect(this.agentSelect()).toBeVisible({ timeout: 15_000 });
    await expect(this.nameInput()).toBeVisible();
    await expect(this.createButton()).toBeVisible();
    await expect(this.cancelButton()).toBeVisible();
  }

  agentSelect(): Locator {
    return this.page
      .locator("main")
      .getByRole("combobox", { name: /^Agent/i })
      .or(this.page.locator("main").getByRole("button", { name: /^Agent/i }))
      .or(this.page.locator("main").getByLabel(/^Agent/i))
      .or(
        this.page
          .locator("main label")
          .filter({ hasText: /^Agent/i })
          .locator("select")
          .first(),
      );
  }

  nameInput(): Locator {
    return this.page
      .locator("main")
      .getByRole("textbox", { name: /^Name/i })
      .or(this.page.locator("main").getByLabel(/^Name/i))
      .or(this.page.locator('main input[name="name"]'));
  }

  descriptionInput(): Locator {
    return this.page
      .locator("main")
      .getByRole("textbox", { name: /^Description/i })
      .or(this.page.locator("main").getByLabel(/^Description/i));
  }

  maxConcurrentInput(): Locator {
    return this.spinbuttonByLabel(/Max concurrent/i);
  }

  retryMaxAttemptsInput(): Locator {
    return this.spinbuttonByLabel(/Retry max attempts/i);
  }

  retryBackoffInput(): Locator {
    return this.spinbuttonByLabel(/Retry backoff/i);
  }

  private spinbuttonByLabel(label: RegExp): Locator {
    return this.page
      .locator("main")
      .getByRole("spinbutton", { name: label })
      .or(
        this.page
          .locator("main label")
          .filter({ hasText: label })
          .locator('input[type="number"]')
          .first(),
      );
  }

  createButton(): Locator {
    return this.page.getByRole("button", { name: /^Create$/i });
  }

  cancelButton(): Locator {
    return this.page.getByRole("button", { name: /^Cancel$/i }).first();
  }

  addPhoneNumbersLink(): Locator {
    return this.page
      .locator("main")
      .getByRole("link", { name: /^Add one in Phone Numbers$/i });
  }

  /** Alias for specs that reference phoneNumbersLink(). */
  phoneNumbersLink(): Locator {
    return this.addPhoneNumbersLink();
  }

  /**
   * True when href omits SPA base (/vap/) — see known-issues CM-LINK-001.
   * Do not fallback-navigate; tests skip or fail honestly until product fix.
   */
  async isPhoneNumbersLinkBroken(): Promise<boolean> {
    const href = await this.addPhoneNumbersLink().getAttribute("href");
    if (!href) return true;
    return !/\/vap\/phone-numbers/.test(href);
  }

  /** Link href may omit /vap/ — see known-issues CM-LINK-001; do not fallback-navigate (hides product bug). */
  async clickAddPhoneNumbersLink() {
    await this.addPhoneNumbersLink().click();
  }

  /**
   * True only when the create form shows the "no phone numbers" empty state.
   * The phone-number section loads async and can briefly render the empty
   * state before the configured "From number" list arrives, so the "From
   * number" combobox (present only when numbers exist) is the decisive
   * settle signal.
   */
  async hasNoPhoneNumbersConfigured(): Promise<boolean> {
    const fromNumber = this.page
      .locator("main")
      .getByRole("combobox", { name: /From number/i });
    const numberAppeared = await fromNumber
      .waitFor({ state: "visible", timeout: 10_000 })
      .then(() => true)
      .catch(() => false);
    if (numberAppeared) return false;
    return this.page
      .locator("main")
      .getByText(/No phone numbers configured/i)
      .isVisible({ timeout: 10_000 })
      .catch(() => false);
  }

  async expectNoPhoneNumbersConfigured() {
    await expect(
      this.page.locator("main").getByText(/No phone numbers configured/i),
    ).toBeVisible({ timeout: 10_000 });
    await expect(this.addPhoneNumbersLink()).toBeVisible();
  }

  async expectDefaultNumericFields() {
    await expect(this.maxConcurrentInput()).toHaveValue(
      CAMPAIGN_DEFAULTS.maxConcurrent,
    );
    await expect(this.retryMaxAttemptsInput()).toHaveValue(
      CAMPAIGN_DEFAULTS.retryMaxAttempts,
    );
    await expect(this.retryBackoffInput()).toHaveValue(
      CAMPAIGN_DEFAULTS.retryBackoffSecs,
    );
  }

  async expectAgentPlaceholderOption() {
    const select = this.agentSelect().first();
    const isSelect = await select.evaluate((el) => el.tagName === "SELECT").catch(() => false);
    if (isSelect) {
      const placeholder = select.locator('option[value=""]');
      if ((await placeholder.count()) > 0) {
        await expect(placeholder.first()).toHaveText(/choose|— choose —|- choose -/i);
      } else {
        await expect(select.locator("option").first()).toHaveText(/choose|— choose —|- choose -/i);
      }
    } else {
      await expect(select).toContainText(/choose|— choose —|- choose -/i);
    }
  }

  async hasSelectableAgent(): Promise<boolean> {
    const select = this.agentSelect();
    const options = select.locator("option");
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const val = await options.nth(i).getAttribute("value");
      const text = (await options.nth(i).textContent()) ?? "";
      if (val && val.trim() && !/choose|select|—/i.test(text)) {
        return true;
      }
    }
    return false;
  }

  async selectFirstAgent(): Promise<string | null> {
    const select = this.agentSelect();
    const options = select.locator("option");
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const val = await options.nth(i).getAttribute("value");
      const text = (await options.nth(i).textContent()) ?? "";
      if (val && val.trim() && !/choose|select|—/i.test(text)) {
        await select.selectOption(val);
        return val;
      }
    }
    return null;
  }

  async fillCreateForm(input: {
    name: string;
    description?: string;
    maxConcurrent?: number;
    retryMaxAttempts?: number;
    retryBackoffSecs?: number;
  }) {
    await this.nameInput().fill(input.name);
    if (input.description) {
      const desc = this.descriptionInput();
      if (await desc.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await desc.fill(input.description);
      }
    }
    if (input.maxConcurrent !== undefined) {
      await this.maxConcurrentInput().fill(String(input.maxConcurrent));
    }
    if (input.retryMaxAttempts !== undefined) {
      await this.retryMaxAttemptsInput().fill(String(input.retryMaxAttempts));
    }
    if (input.retryBackoffSecs !== undefined) {
      await this.retryBackoffInput().fill(String(input.retryBackoffSecs));
    }
  }

  async submitCreate() {
    await this.createButton().click();
  }

  async cancelCreate() {
    await this.cancelButton().click();
  }

  async expectCreateBlocked() {
    await expect(this.page).toHaveURL(/\/campaigns/, { timeout: 5_000 });
    await expect(this.createButton()).toBeVisible();
  }
}
