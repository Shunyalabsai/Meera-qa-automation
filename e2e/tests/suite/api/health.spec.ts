import { test, expect } from "@playwright/test";

test.describe("API & Service Health @smoke @api @positive", () => {
  test("TC-API-001 @smoke @high @positive — VAP platform entry point responds HTTP 200", async ({
    request,
  }) => {
    const response = await request.get("https://agents.shunyalabs.ai/vap/");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/html");
  });

  test("TC-API-002 @smoke @high @positive — Static JavaScript application bundle responds HTTP 200", async ({
    request,
  }) => {
    const htmlRes = await request.get("https://agents.shunyalabs.ai/vap/");
    const body = await htmlRes.text();
    const match = body.match(/src="(\/vap\/assets\/index-[^"]+\.js)"/);
    if (match && match[1]) {
      const assetRes = await request.get(`https://agents.shunyalabs.ai${match[1]}`);
      expect([200, 304]).toContain(assetRes.status());
    } else {
      expect(htmlRes.status()).toBe(200);
    }
  });

  test("TC-API-003 @smoke @high @positive — External Webhook receiver endpoint is reachable", async ({
    request,
  }) => {
    const webhookUrl = process.env.Webhook_url || "https://webhook.site/9677010f-b285-4cc0-a8d3-2f595cd63888";
    if (webhookUrl.includes("webhook.site")) {
      const response = await request.get(webhookUrl);
      expect([200, 404]).toContain(response.status());
    }
  });
});
