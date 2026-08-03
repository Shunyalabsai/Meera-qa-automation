import { test, expect } from "@playwright/test";
import { openPlayground } from "../../../../helpers/playground.helper";
import { PlaygroundPage } from "../../../../pages/playground.page";
import { PLAYGROUND_SAMPLES } from "../../../../data/playground-data";

test.describe("BUILD › Playground — Phone Call mode @journey @new-user @playground @positive", () => {
  test.beforeEach(async ({ page }) => {
    const playground = await openPlayground(page);
    await playground.switchToPhoneMode();
  });

  test("TC-PG-020 @high @positive — Phone Call mode shows Plivo dial panel", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    await playground.expectPhoneModePanel();
    await expect(
      page.getByText(/Dials the customer via Plivo|configured pipeline/i).first(),
    ).toBeVisible();
  });

  test("TC-PG-021 @high @positive — From number dropdown with org default", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    await expect(page.getByText(/From number/i).first()).toBeVisible();
    const fromSelect = playground.fromNumberSelect();
    await expect(fromSelect).toBeVisible();
    await expect(
      fromSelect.locator("option").filter({ hasText: /Use org default|org default/i }),
    ).toHaveCount(1);
  });

  test("TC-PG-022 @high @positive — To number field with country code", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    await expect(page.locator("main").getByText(/To number/i).first()).toBeVisible();
    // Assert the tel input by placeholder — an unscoped getByText(/\+91/) matches
    // the hidden From-number <option> ("+918031137171 - …") before the input.
    await expect(playground.toNumberInput()).toBeVisible();
  });

  test("TC-PG-023 @high @positive — Context variables textarea visible", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    await expect(
      page.getByText(/Context variables|JSON or key=value/i).first(),
    ).toBeVisible();
    await expect(playground.contextVariablesInput()).toBeVisible();
  });

  test("TC-PG-024 @high @positive — Start Phone Call button visible", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    await expect(playground.startPhoneCallButton()).toBeVisible();
  });

  test("TC-PG-025 @medium @positive — Fill valid to number and context JSON", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    await playground.fillToNumber(PLAYGROUND_SAMPLES.validIndianNumber);
    await playground.fillContextVariables(PLAYGROUND_SAMPLES.validContextJson);
    await expect(playground.toNumberInput()).toHaveValue(
      PLAYGROUND_SAMPLES.validIndianNumber,
    );
    await expect(playground.contextVariablesInput()).toContainText("customer_name");
  });

  test("TC-PG-026 @medium @positive — Context variables accept key=value per line", async ({
    page,
  }) => {
    const playground = new PlaygroundPage(page);
    await playground.fillContextVariables(PLAYGROUND_SAMPLES.validContextKeyValue);
    await expect(playground.contextVariablesInput()).toContainText("customer_name=Rahul");
  });

});
