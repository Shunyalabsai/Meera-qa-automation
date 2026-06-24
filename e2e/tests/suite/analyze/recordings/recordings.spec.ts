import { test, expect } from "@playwright/test";
import { RecordingsPage } from "../../../../pages/recordings.page";

test.describe("ANALYZE › Recordings @smoke @recordings", () => {
  test("TC-RC-001 @high @positive — Recordings page loads", async ({ page }) => {
    const recordings = new RecordingsPage(page);
    await recordings.open();
    await recordings.expectSearchAndFilterVisible();
    await recordings.expectEmptyOrTable();
  });
});
