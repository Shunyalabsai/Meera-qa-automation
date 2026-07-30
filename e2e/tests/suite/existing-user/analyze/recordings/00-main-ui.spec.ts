import { test, expect } from "@playwright/test";
import { openRecordings } from "../../../../../helpers/recordings.helper";
import { skipUnlessHasRecordings } from "../../../../../helpers/existing-user.helper";

test.describe("ANALYZE › Recordings — Populated list @journey @existing-user @recordings @ui", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasRecordings(page, testInfo);
  });

  test("TC-RC-EU-001 @high @ui — Recordings table visible", async ({ page }) => {
    const recordings = await openRecordings(page);
    await recordings.expectHasRecordings();
  });

  test("TC-RC-EU-002 @high @ui — Search and agent filter visible", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await recordings.expectSearchAndFilterVisible();
  });
});
