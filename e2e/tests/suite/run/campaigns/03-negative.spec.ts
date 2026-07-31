import { test, expect } from "@playwright/test";
import { openCampaignCreateForm } from "../../../../helpers/campaigns.helper";
import { CampaignsPage } from "../../../../pages/campaigns.page";
import { uniqueName } from "../../../../utils/test-data";

test.describe("RUN › Campaigns — Validation @journey @new-user @campaigns @negative", () => {
  test.beforeEach(async ({ page }) => {
    await openCampaignCreateForm(page);
  });

  test("TC-CM-N101 @high @negative — Create without agent selected is blocked", async ({
    page,
  }) => {
    const campaigns = new CampaignsPage(page);
    await campaigns.nameInput().fill(uniqueName("NoAgent"));
    await campaigns.submitCreate();

    const agentSelect = campaigns.agentSelect();
    const htmlInvalid = await agentSelect
      .evaluate((el: HTMLSelectElement) => !el.checkValidity())
      .catch(() => false);

    const uiError = await page
      .getByText(/select an item|choose.*agent|required|Fix the highlighted/i)
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    expect(htmlInvalid || uiError).toBe(true);
    await campaigns.expectCreateBlocked();
  });

  test("TC-CM-N102 @high @negative — Create without name is blocked", async ({
    page,
  }) => {
    const campaigns = new CampaignsPage(page);
    test.skip(
      !(await campaigns.hasSelectableAgent()),
      "No agents available to select",
    );

    await campaigns.selectFirstAgent();
    await campaigns.nameInput().clear();
    await campaigns.submitCreate();

    const nameInput = campaigns.nameInput();
    const htmlInvalid = await nameInput
      .evaluate((el: HTMLInputElement) => !el.checkValidity())
      .catch(() => false);

    const uiError = await page
      .getByText(/required|name|Fix the highlighted|fill in this field/i)
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    expect(htmlInvalid || uiError).toBe(true);
    await campaigns.expectCreateBlocked();
  });

  test("TC-CM-N103 @medium @negative — Whitespace-only name blocked", async ({
    page,
  }) => {
    const campaigns = new CampaignsPage(page);
    if (await campaigns.hasSelectableAgent()) {
      await campaigns.selectFirstAgent();
    }
    await campaigns.nameInput().fill("   ");
    await campaigns.submitCreate();
    await campaigns.expectCreateBlocked();
  });

  test("TC-CM-N104 @medium @negative — Max concurrent zero blocked", async ({
    page,
  }) => {
    const campaigns = new CampaignsPage(page);
    await campaigns.fillCreateForm({
      name: uniqueName("ZeroConcurrent"),
      maxConcurrent: 0,
    });
    if (await campaigns.hasSelectableAgent()) {
      await campaigns.selectFirstAgent();
    }
    await campaigns.submitCreate();
    await expect(
      page.getByText(/concurrent|minimum|Fix the highlighted|invalid/i).first(),
    ).toBeVisible({ timeout: 10_000 }).catch(async () => {
      await campaigns.expectCreateBlocked();
    });
  });

  test("TC-CM-N105 @medium @negative — Retry backoff negative value blocked", async ({
    page,
  }) => {
    const campaigns = new CampaignsPage(page);
    await campaigns.fillCreateForm({
      name: uniqueName("NegBackoff"),
      retryBackoffSecs: -1,
    });
    if (await campaigns.hasSelectableAgent()) {
      await campaigns.selectFirstAgent();
    }
    await campaigns.submitCreate();
    await campaigns.expectCreateBlocked();
  });
});
