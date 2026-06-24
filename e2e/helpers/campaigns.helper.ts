import { Page } from "@playwright/test";
import { CampaignsPage } from "../pages/campaigns.page";

export async function openCampaignsList(page: Page): Promise<CampaignsPage> {
  const campaigns = new CampaignsPage(page);
  await campaigns.open();
  return campaigns;
}

export async function openCampaignCreateForm(page: Page): Promise<CampaignsPage> {
  const campaigns = new CampaignsPage(page);
  await campaigns.open();
  if (await campaigns.isEmptyState()) {
    await campaigns.clickNewCampaign();
  } else {
    await campaigns.newCampaignButton().click();
    await campaigns.expectCreateForm();
  }
  return campaigns;
}

export async function isCampaignsEmptyState(page: Page): Promise<boolean> {
  const campaigns = new CampaignsPage(page);
  await campaigns.open();
  return campaigns.isEmptyState();
}
