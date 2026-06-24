import { test, expect } from "@playwright/test";
import { openRecordings } from "../../../../helpers/recordings.helper";
import { RECORDINGS_SAMPLES } from "../../../../data/recordings-data";

test.describe("ANALYZE › Recordings — CTA functional @recordings @cta", () => {
  test("CTA-RC-001 @high @cta — Search submit filters results", async ({ page }) => {
    const recordings = await openRecordings(page);
    await recordings.search(RECORDINGS_SAMPLES.phoneNumber);
    await recordings.expectEmptyOrTable();
  });

  test("CTA-RC-002 @medium @cta — All agents filter selectable", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await recordings.selectAgentFilter("All agents");
    await recordings.expectEmptyOrTable();
  });
});
