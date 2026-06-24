import { test } from "@playwright/test";
import { CampaignsPage } from "../../../../pages/campaigns.page";

test.describe("RUN › Campaigns @smoke", () => {
  test("Campaigns page loads", async ({ page }) => {
    const campaigns = new CampaignsPage(page);
    await campaigns.open();
  });
});
