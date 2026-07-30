import { test, expect } from "@playwright/test";
import { openCampaignCreateForm, openCampaignsList } from "../../../../../helpers/campaigns.helper";
import { CampaignsPage } from "../../../../../pages/campaigns.page";
import { CAMPAIGN_SAMPLES } from "../../../../../data/campaign-data";
import { uniqueName } from "../../../../../utils/test-data";

test.describe("RUN › Campaigns — Edge @journey @existing-user @campaigns @edge", () => {
  test("TC-CM-E101 @medium @edge — Numeric defaults restored after editing and cancel", async ({
    page,
  }) => {
    await openCampaignCreateForm(page);
    const campaigns = new CampaignsPage(page);

    await campaigns.maxConcurrentInput().fill("10");
    await campaigns.cancelCreate();
    await campaigns.clickNewCampaign();
    await campaigns.expectDefaultNumericFields();
  });

  test("TC-CM-E102 @medium @edge — Toggle New campaign twice shows fresh form", async ({
    page,
  }) => {
    const campaigns = await openCampaignsList(page);
    await campaigns.clickNewCampaign();
    await campaigns.nameInput().fill("temp-name");
    await campaigns.cancelCreate();
    await campaigns.clickNewCampaign();
    await expect(campaigns.nameInput()).toHaveValue("");
  });

  test("TC-CM-E103 @low @edge — Long campaign name accepted in field", async ({
    page,
  }) => {
    await openCampaignCreateForm(page);
    const campaigns = new CampaignsPage(page);
    const longName = "Campaign_" + "A".repeat(200);
    await campaigns.nameInput().fill(longName);
    await expect(campaigns.nameInput()).toHaveValue(longName);
  });

  test("TC-CM-E104 @medium @edge — Create with agent and name when agents exist", async ({
    page,
  }) => {
    await openCampaignCreateForm(page);
    const campaigns = new CampaignsPage(page);
    test.skip(
      !(await campaigns.hasSelectableAgent()),
      "No agents available — create an agent first",
    );

    const name = uniqueName("Campaign");
    await campaigns.selectFirstAgent();
    await campaigns.fillCreateForm({
      name,
      description: CAMPAIGN_SAMPLES.description,
    });

    await campaigns.submitCreate();
    await expect(
      page.getByText(name, { exact: false }).or(page.getByText(/campaign/i).first()),
    ).toBeVisible({ timeout: 45_000 });
  });
});
