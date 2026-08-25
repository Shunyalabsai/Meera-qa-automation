import { test, expect } from "@playwright/test";
import {
  openWebhooks,
  hasAnySubscribeButton,
  hasEnabledQuickApplyCheckboxes,
} from "../../../../../helpers/webhooks.helper";
import { reloadSpaRoute, gotoApp } from "../../../../../helpers/navigate";
import { WEBHOOKS_COPY, WEBHOOKS_SAMPLES } from "../../../../../data/webhooks-data";

test.describe("SETTINGS › Webhooks — Edge @journey @existing-user @webhooks @edge", () => {
  test("TC-WH-E101 @medium @edge — Navigate away and back preserves Webhooks page", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await page.getByRole("link", { name: /^Billing$/i }).click();
    await expect(page).toHaveURL(/\/billing/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Webhooks$/i }).click();
    await webhooks.expectPageHeader();
  });

  test("TC-WH-E102 @low @edge — Page reload keeps Webhooks heading", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await reloadSpaRoute(page, "admin/webhooks");
    await webhooks.expectPageHeader();
  });

  test("TC-WH-E103 @medium @edge — Select all then Clear resets selection count to zero", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.selectAllButton().click();
    await expect(page.getByText(WEBHOOKS_COPY.selectedCount)).toBeVisible({
      timeout: 10_000,
    });
    await webhooks.clearButton().click();
    await expect(page.getByText(/0 selected.*0 will be created/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("TC-WH-E104 @medium @edge — Opening subscribe on second event switches expanded form", async ({
    page,
  }) => {
    test.skip(
      !(await hasAnySubscribeButton(page)),
      "[env-precondition] Events already subscribed — Subscribe flow not available",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.clickSubscribeForEvent("call.triggered");
    await expect(webhooks.eventRow("call.triggered").getByRole("button", { name: /^Save subscription$/i })).toBeVisible();
    await webhooks.clickSubscribeForEvent("call.connected");
    await expect(webhooks.eventRow("call.connected").getByRole("button", { name: /^Save subscription$/i })).toBeVisible();
    await webhooks.eventRow("call.triggered").getByRole("button", { name: /^Cancel$/i }).click();
    await expect(webhooks.subscribeButtonForEvent("call.triggered")).toBeVisible();
  });

  test("TC-WH-E105 @medium @edge — Custom event Cancel then reopen shows form again", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.clickCustomEventLink();
    await webhooks.cancelCustomEventButton().click();
    await webhooks.clickCustomEventLink();
    await webhooks.expectCustomEventSectionVisible();
  });

  test("TC-WH-E106 @low @edge — Single checkbox then Select all checks remaining events", async ({
    page,
  }) => {
    test.skip(
      !(await hasEnabledQuickApplyCheckboxes(page)),
      "[env-precondition] All quick-apply events already subscribed — checkboxes disabled",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.eventCheckbox("call.triggered").first().check();
    await webhooks.selectAllButton().click();
    await expect(webhooks.eventCheckbox("call.connected").first()).toBeChecked();
    await expect(webhooks.eventCheckbox("transfer.initiated").first()).toBeChecked();
  });

  test("TC-WH-E107 @medium @edge — Navigate from Alerts sidebar to Webhooks", async ({
    page,
  }) => {
    await gotoApp(page, "alerts");
    await page.getByRole("link", { name: /^Webhooks$/i }).click();
    await expect(page).toHaveURL(/\/webhooks/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: /^Webhooks$/i })).toBeVisible();
  });

  test("TC-WH-E108 @medium @edge — Quick apply fields retain values after checkbox toggle", async ({
    page,
  }) => {
    test.skip(
      !(await hasEnabledQuickApplyCheckboxes(page)),
      "[env-precondition] All quick-apply events already subscribed — checkboxes disabled",
    );
    const webhooks = await openWebhooks(page);
    await webhooks.fillQuickApply(
      WEBHOOKS_SAMPLES.validUrl,
      WEBHOOKS_SAMPLES.validSecret,
    );
    await webhooks.eventCheckbox("call.connected").first().check();
    await webhooks.eventCheckbox("call.connected").first().uncheck();
    await expect(webhooks.quickApplyUrlInput()).toHaveValue(WEBHOOKS_SAMPLES.validUrl);
    await expect(webhooks.quickApplySecretInput()).toHaveValue(
      WEBHOOKS_SAMPLES.validSecret,
    );
  });

});
