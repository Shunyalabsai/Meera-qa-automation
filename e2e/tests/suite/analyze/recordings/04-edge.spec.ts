import { test, expect } from "@playwright/test";
import { openRecordings } from "../../../../helpers/recordings.helper";
import { RECORDINGS_SAMPLES } from "../../../../data/recordings-data";
import { VALID_UUID } from "../../../../utils/test-data";

test.describe("ANALYZE › Recordings — Edge @journey @new-user @recordings @edge", () => {
  test("TC-RC-E101 @medium @edge — Search plus agent filter keeps page stable", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await recordings.selectAgentFilter("All agents");
    await recordings.search(RECORDINGS_SAMPLES.phoneNumber);
    await recordings.expectEmptyOrTable();
  });

  test("TC-RC-E102 @medium @edge — Navigate away and back preserves Recordings page", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await page.getByRole("link", { name: /^Calls$/i }).click();
    await expect(page).toHaveURL(/\/calls/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Recordings$/i }).click();
    await recordings.expectPageHeader();
    await recordings.expectSearchAndFilterVisible();
    await recordings.expectEmptyOrTable();
  });

  test("TC-RC-E103 @medium @edge — ANALYZE section siblings reachable from Recordings", async ({
    page,
  }) => {
    await openRecordings(page);
    await page.getByRole("link", { name: /^Calls$/i }).click();
    await expect(page).toHaveURL(/\/calls/, { timeout: 30_000 });
    await page.getByRole("link", { name: /^Insights$/i }).click();
    await expect(page).toHaveURL(/\/insights/, { timeout: 30_000 });
  });

  test("TC-RC-E104 @low @edge — Page reload keeps heading and search controls", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await recordings.expectSearchAndFilterVisible();
    await recordings.reloadAndRecover();
    await recordings.expectPageHeader();
    await recordings.expectSearchAndFilterVisible();
  });

  test("TC-RC-E105 @medium @edge — Very long search string accepted without crash", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await recordings.search(RECORDINGS_SAMPLES.longSearch);
    await recordings.expectPageHeader();
    await recordings.expectEmptyOrTable();
  });

  test("TC-RC-E106 @medium @edge — Sequential searches replace previous query", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await recordings.search(VALID_UUID);
    await recordings.search(RECORDINGS_SAMPLES.phoneNumber);
    await recordings.expectEmptyOrTable();
  });

  test("TC-RC-E107 @medium @edge @manual — Recording appears after completed call", async () => {
    test.skip(
      true,
      "Manual/telephony: complete call with recording enabled, verify row on Recordings",
    );
  });
});
