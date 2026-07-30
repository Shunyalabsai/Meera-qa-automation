import { test, expect } from "@playwright/test";
import { openCampaignsList } from "../../../../../helpers/campaigns.helper";
import { skipUnlessHasCampaigns } from "../../../../../helpers/existing-user.helper";

test.describe("RUN › Campaigns — Populated list @journey @existing-user @campaigns @ui", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasCampaigns(page, testInfo);
  });

  test("TC-CM-EU-001 @high @ui — Campaign list not empty", async ({ page }) => {
    const campaigns = await openCampaignsList(page);
    await expect(campaigns.newCampaignButton()).toBeVisible();
    await expect(page.getByText(/No campaigns yet/i)).not.toBeVisible();
  });
});
