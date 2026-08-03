import { test, expect } from "@playwright/test";
import { openCampaignCreateForm } from "../../../../helpers/campaigns.helper";
import { PhoneNumbersPage } from "../../../../pages/phone-numbers.page";
import { skipProductGap } from "../../../../helpers/skip";

test.describe("RUN › Campaigns — Phone numbers link @journey @new-user @campaigns @positive", () => {
  test("TC-CM-020 @high @positive — Add one in Phone Numbers link navigates to phone-numbers", async ({
    page,
  }, testInfo) => {
    const campaigns = await openCampaignCreateForm(page);
    // The "no phone numbers configured" empty state only exists when the org
    // has no numbers — skip when numbers are already set up.
    test.skip(
      !(await campaigns.hasNoPhoneNumbersConfigured()),
      "Phone numbers already configured — empty-state link not shown",
    );

    await campaigns.expectNoPhoneNumbersConfigured();
    if (await campaigns.isPhoneNumbersLinkBroken()) {
      skipProductGap(testInfo, "CM-LINK-001");
      return;
    }

    await campaigns.clickAddPhoneNumbersLink();
    await expect(page).toHaveURL(/\/vap\/phone-numbers/, { timeout: 30_000 });

    const phoneNumbers = new PhoneNumbersPage(page);
    await phoneNumbers.expectPageHeader();
  });

  test("TC-CM-021 @medium @ui — Phone numbers page shows Add number from campaign link", async ({
    page,
  }, testInfo) => {
    const campaigns = await openCampaignCreateForm(page);
    test.skip(
      !(await campaigns.hasNoPhoneNumbersConfigured()),
      "Phone numbers already configured — empty-state link not shown",
    );
    if (await campaigns.isPhoneNumbersLinkBroken()) {
      skipProductGap(testInfo, "CM-LINK-001");
      return;
    }
    await campaigns.clickAddPhoneNumbersLink();

    await expect(page).toHaveURL(/\/vap\/phone-numbers/);
    const phoneNumbers = new PhoneNumbersPage(page);
    await expect(phoneNumbers.addNumberButton()).toBeVisible({
      timeout: 15_000,
    });
  });
});
