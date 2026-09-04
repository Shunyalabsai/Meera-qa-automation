import { test } from "@playwright/test";
import { WebhooksPage } from "../../../../pages/webhooks.page";

test.describe("SETTINGS › Webhooks @webhooks", () => {
  test("TC-IN-001 @high @positive — Webhooks admin page loads", async ({
    page,
  }) => {
    const webhooks = new WebhooksPage(page);
    await webhooks.open();
  });
});
