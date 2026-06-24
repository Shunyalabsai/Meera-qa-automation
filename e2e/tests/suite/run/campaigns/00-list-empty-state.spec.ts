import { test, expect } from "@playwright/test";
import { CampaignsPage } from "../../../../pages/campaigns.page";
import { isCampaignsEmptyState } from "../../../../helpers/campaigns.helper";

test.describe("RUN › Campaigns — List empty state @journey @new-user @campaigns", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !(await isCampaignsEmptyState(page)),
      "Campaigns already exist — empty state not shown",
    );
  });

  test("TC-CM-001 @high @ui — Empty state shows No campaigns yet", async ({
    page,
  }) => {
    const campaigns = new CampaignsPage(page);
    await campaigns.expectEmptyState();
  });

  test("TC-CM-002 @high @ui — Header and outbound bulk calling subtitle", async ({
    page,
  }) => {
    const campaigns = new CampaignsPage(page);
    await campaigns.expectListHeader();
    await expect(
      page.getByText(/upload contacts|run dispatch in batches|watch progress live/i).first(),
    ).toBeVisible();
  });

  test("TC-CM-003 @high @positive — New campaign button visible and enabled", async ({
    page,
  }) => {
    const campaigns = new CampaignsPage(page);
    await expect(campaigns.newCampaignButton()).toBeVisible();
    await expect(campaigns.newCampaignButton()).toBeEnabled();
  });

  test("TC-CM-004 @medium @ui — Sidebar Campaigns nav link visible", async ({
    page,
  }) => {
    const campaigns = new CampaignsPage(page);
    await campaigns.open();
    await expect(
      page.getByRole("link", { name: /^Campaigns$/i }),
    ).toBeVisible();
  });
});
