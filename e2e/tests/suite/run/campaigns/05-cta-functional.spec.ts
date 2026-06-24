import { test, expect } from "@playwright/test";
import { openCampaignCreateForm, openCampaignsList } from "../../../../helpers/campaigns.helper";
import { skipProductGap } from "../../../../helpers/skip";

test.describe("RUN › Campaigns — CTA functional @campaigns @cta", () => {
  test("CTA-CM-001 @high @cta — New campaign opens create form", async ({ page }) => {
    const campaigns = await openCampaignsList(page);
    await campaigns.clickNewCampaign();
    await campaigns.expectCreateForm();
  });

  test("CTA-CM-002 @high @cta — Phone Numbers link navigates from create form", async ({
    page,
  }, testInfo) => {
    const campaigns = await openCampaignCreateForm(page);
    await campaigns.expectNoPhoneNumbersConfigured();
    if (await campaigns.isPhoneNumbersLinkBroken()) {
      skipProductGap(testInfo, "CM-LINK-001");
      return;
    }
    await campaigns.clickAddPhoneNumbersLink();
    await expect(page).toHaveURL(/\/vap\/phone-numbers/, { timeout: 30_000 });
  });

  test("CTA-CM-003 @medium @cta — Cancel closes create form", async ({ page }) => {
    const campaigns = await openCampaignCreateForm(page);
    await campaigns.cancelCreate();
    await expect(campaigns.newCampaignButton()).toBeVisible();
  });
});
