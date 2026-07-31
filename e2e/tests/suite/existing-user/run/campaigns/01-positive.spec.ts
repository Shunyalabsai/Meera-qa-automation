import { test } from "@playwright/test";
import { openCampaignsList } from "../../../../../helpers/campaigns.helper";
import { skipUnlessHasCampaigns } from "../../../../../helpers/existing-user.helper";

test.describe("RUN › Campaigns — Positive @journey @existing-user @campaigns @positive", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasCampaigns(page, testInfo);
  });

  test("TC-CM-EU-010 @high @positive — New campaign button opens form", async ({
    page,
  }) => {
    const campaigns = await openCampaignsList(page);
    await campaigns.newCampaignButton().click();
    await campaigns.expectCreateForm();
  });
});
