import { test, expect } from "@playwright/test";

test.describe("Backend API Health @smoke @api @positive", () => {
  test("TC-API-000 @smoke @high @positive — Backend API Health endpoint responds HTTP 200 with status ok", async ({
    request,
  }) => {
    const response = await request.get("https://agents.shunyalabs.ai/api/health");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("ok");
  });

  test("TC-API-001 @smoke @high @positive — Backend State Integrity endpoint responds HTTP 200 with ok true", async ({
    request,
  }) => {
    const response = await request.get("https://agents.shunyalabs.ai/api/health/state-integrity");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.errors).toEqual([]);
  });
});


