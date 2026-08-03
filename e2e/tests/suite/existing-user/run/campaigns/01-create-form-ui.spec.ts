import { test, expect } from "@playwright/test";
import { openCampaignCreateForm } from "../../../../../helpers/campaigns.helper";
import { CampaignsPage } from "../../../../../pages/campaigns.page";
import { CAMPAIGN_SAMPLES } from "../../../../../data/campaign-data";

test.describe("RUN › Campaigns — Create form UI @journey @existing-user @campaigns @positive", () => {
  test.beforeEach(async ({ page }) => {
    await openCampaignCreateForm(page);
  });

  test("TC-CM-010 @high @ui — Create form shows Agent and Name required fields", async ({
    page,
  }) => {
    const campaigns = new CampaignsPage(page);
    await expect(campaigns.agentSelect()).toBeVisible();
    await expect(campaigns.nameInput()).toBeVisible();
    await expect(page.getByText(/\*/).first()).toBeVisible();
  });

  test("TC-CM-011 @high @positive — Default max concurrent 5, retry 2, backoff 60", async ({
    page,
  }) => {
    const campaigns = new CampaignsPage(page);
    await campaigns.expectDefaultNumericFields();
  });

  test("TC-CM-012 @high @ui — From number shows no phone numbers configured message", async ({
    page,
  }) => {
    const campaigns = new CampaignsPage(page);
    // Empty-state message only appears when the org has no phone numbers.
    test.skip(
      !(await campaigns.hasNoPhoneNumbersConfigured()),
      "Phone numbers already configured — empty-state message not shown",
    );
    await campaigns.expectNoPhoneNumbersConfigured();
  });

  test("TC-CM-013 @medium @positive — Description optional field accepts text", async ({
    page,
  }) => {
    const campaigns = new CampaignsPage(page);
    const desc = campaigns.descriptionInput();
    if (await desc.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await desc.fill(CAMPAIGN_SAMPLES.description);
      await expect(desc).toHaveValue(CAMPAIGN_SAMPLES.description);
    }
  });

  test("TC-CM-014 @medium @positive — Name and numeric fields accept input", async ({
    page,
  }) => {
    const campaigns = new CampaignsPage(page);
    await campaigns.fillCreateForm({
      name: CAMPAIGN_SAMPLES.name,
      maxConcurrent: 3,
      retryMaxAttempts: 1,
      retryBackoffSecs: 30,
    });
    await expect(campaigns.nameInput()).toHaveValue(CAMPAIGN_SAMPLES.name);
    await expect(campaigns.maxConcurrentInput()).toHaveValue("3");
  });

  test("TC-CM-015 @medium @positive — Cancel returns to campaigns list", async ({
    page,
  }) => {
    const campaigns = new CampaignsPage(page);
    await campaigns.nameInput().fill("should-not-be-created");
    await campaigns.cancelCreate();
    await campaigns.expectListHeader();
    await expect(page.getByText("should-not-be-created")).not.toBeVisible({
      timeout: 3_000,
    });
  });

  test("TC-CM-016 @medium @positive — Agent dropdown lists choose placeholder", async ({
    page,
  }) => {
    const campaigns = new CampaignsPage(page);
    await campaigns.expectAgentPlaceholderOption();
  });
});
