import { Page, expect, Locator } from "@playwright/test";
import { gotoApp, waitForLoadingToClear } from "../helpers/navigate";

/** RUN › Phone numbers — register Plivo/Twilio numbers. */
export class PhoneNumbersPage {
  constructor(private readonly page: Page) {}

  async open() {
    await gotoApp(this.page, "phone-numbers");
    await this.expectPageHeader();
    await this.waitForListSettled();
  }

  async expectPageHeader() {
    await expect(
      this.page.getByRole("heading", { name: /Phone numbers/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      this.page.getByText(/Plivo or Twilio|encrypted at rest/i).first(),
    ).toBeVisible();
  }

  /**
   * The numbers list and "Telephony accounts (N)" control render only after the
   * data fetch resolves. Reading the empty state before then yields a false
   * "not empty" (the empty message hasn't painted yet). The Telephony accounts
   * control is present in both empty and populated states, so use it as the
   * settle signal.
   */
  async waitForListSettled(): Promise<void> {
    await waitForLoadingToClear(this.page);
    await this.page
      .getByRole("button", { name: /Telephony accounts/i })
      .first()
      .waitFor({ state: "visible", timeout: 30_000 })
      .catch(() => undefined);
  }

  async isEmptyState(): Promise<boolean> {
    await this.waitForListSettled();
    return this.page
      .getByText(/No phone numbers registered yet/i)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
  }

  async expectEmptyState() {
    await this.expectPageHeader();
    await expect(this.addNumberButton()).toBeVisible();
    await expect(
      this.page.getByText(/No phone numbers registered yet/i),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      this.page.getByText(/Click.*Add number|register a Plivo or Twilio/i).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText(/selectable from the agent and campaign forms/i).first(),
    ).toBeVisible();
    await this.expectTelephonyAccountsEmpty();
  }

  async expectTelephonyAccountsEmpty() {
    const accountsToggle = this.page.getByRole("button", {
      name: /Telephony accounts\s*\(\s*0\s*\)/i,
    });
    await expect(accountsToggle).toBeVisible({ timeout: 10_000 });
  }

  addNumberButton(): Locator {
    return this.page.getByRole("button", { name: /Add number/i });
  }

  async clickAddNumber() {
    await this.addNumberButton().click();
    await this.expectAddNumberModal();
  }

  /**
   * The Add phone number modal renders in a portal at the document root
   * (outside <main>), so it can't be scoped via a `main`-relative locator.
   * Resolve it as the nearest ancestor that also contains the submit button.
   */
  addNumberPanel(): Locator {
    return this.page
      .getByRole("heading", { name: /^Add phone number$/i })
      .locator("xpath=ancestor::div[.//button[normalize-space()='Add number']][1]");
  }

  addNumberModal(): Locator {
    return this.addNumberPanel();
  }

  async expectAddNumberModal() {
    await expect(
      this.addNumberPanel().getByRole("heading", { name: /^Add phone number$/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(this.addNumberPanel().getByText(/^Account$/i).first()).toBeVisible();
    await expect(this.addNumberPanel().getByText(/^Number$/i).first()).toBeVisible();
  }

  useExistingAccountRadio(): Locator {
    return this.addNumberPanel().getByRole("radio", {
      name: /Use an existing account/i,
    });
  }

  setupNewAccountRadio(): Locator {
    return this.addNumberPanel().getByRole("radio", {
      name: /Set up a new account/i,
    });
  }

  /**
   * The modal defaults to "Use an existing account" when the org already has a
   * telephony account — which hides the Plivo/Twilio provider radios. Ensure
   * the "Set up a new account" form is active before interacting with those.
   * No-op when the modal already defaults to the new-account form.
   */
  async ensureNewAccountMode() {
    const existing = this.useExistingAccountRadio();
    if (await existing.isChecked().catch(() => false)) {
      await this.setupNewAccountRadio().click();
      await expect(this.setupNewAccountRadio()).toBeChecked();
    }
  }

  accountLabelInput(): Locator {
    return this.addNumberPanel().getByRole("textbox", {
      name: /Account label/i,
    });
  }

  authIdInput(): Locator {
    return this.addNumberPanel().getByRole("textbox", {
      name: /Plivo Auth ID|Auth ID|Account SID/i,
    });
  }

  authTokenInput(): Locator {
    return this.addNumberPanel().getByRole("textbox", { name: /^Auth token$/i });
  }

  numberInput(): Locator {
    return this.addNumberPanel()
      .getByRole("textbox", { name: /^Number$|\+12345550100|\+1/ })
      .or(this.addNumberPanel().getByPlaceholder(/\+12345550100|\+1/i));
  }

  numberLabelInput(): Locator {
    return this.addNumberPanel().getByRole("textbox", {
      name: /Label \(optional/i,
    });
  }

  modalCancelButton(): Locator {
    return this.addNumberPanel().getByRole("button", { name: /^Cancel$/i });
  }

  modalAddNumberButton(): Locator {
    return this.addNumberPanel().getByRole("button", { name: /^Add number$/i });
  }

  async canUseExistingAccount(): Promise<boolean> {
    return !(await this.useExistingAccountRadio().isDisabled());
  }

  async expectNewAccountPlivoFields() {
    await this.ensureNewAccountMode();
    await expect(this.setupNewAccountRadio()).toBeChecked();
    await expect(this.authIdInput()).toBeVisible();
    await expect(this.authTokenInput()).toBeVisible();
  }

  async switchToExistingAccount() {
    const radio = this.useExistingAccountRadio();
    await expect(radio).toBeEnabled({ timeout: 5_000 });
    await radio.click();
    await expect(radio).toBeChecked();
  }

  async submitAddNumber() {
    await this.modalAddNumberButton().click();
  }

  async cancelAddNumber() {
    await this.modalCancelButton().click();
  }

  async expectAddBlocked() {
    await expect(this.addNumberPanel()).toBeVisible({ timeout: 5_000 });
  }

  /** Submit blocked by native HTML5 validation — modal stays open; no visible error toast. */
  async expectSubmitBlocked() {
    await this.expectAddBlocked();
    const authIdInvalid = await this.authIdInput().evaluate(
      (el) => !(el as HTMLInputElement).validity.valid,
    );
    const numberInvalid = await this.numberInput()
      .first()
      .evaluate((el) => !(el as HTMLInputElement).validity.valid);
    expect(authIdInvalid || numberInvalid).toBe(true);
  }
}
