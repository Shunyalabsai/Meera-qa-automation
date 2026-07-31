import { test } from "@playwright/test";
import { openWebhooks } from "../../../../../helpers/webhooks.helper";
import { skipUnlessHasWebhookSubscriptions } from "../../../../../helpers/existing-user.helper";

test.describe("SETTINGS › Webhooks — Positive @journey @existing-user @webhooks @positive", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasWebhookSubscriptions(page, testInfo);
  });

  test("TC-WH-EU-010 @medium @positive — Quick apply section visible", async ({
    page,
  }) => {
    const webhooks = await openWebhooks(page);
    await webhooks.expectQuickApplySection();
  });
});
