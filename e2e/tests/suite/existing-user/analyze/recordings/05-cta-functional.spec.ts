import { test, expect } from "@playwright/test";
import { openRecordings } from "../../../../../helpers/recordings.helper";
import { skipUnlessHasRecordings } from "../../../../../helpers/existing-user.helper";
import { RECORDINGS_SAMPLES } from "../../../../../data/recordings-data";

test.describe("ANALYZE › Recordings — CTA with data @journey @existing-user @recordings @cta", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await skipUnlessHasRecordings(page, testInfo);
  });

  test("CTA-RC-EU-001 @high @cta — Search submit filters results", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await recordings.search(RECORDINGS_SAMPLES.phoneNumber);
    await recordings.expectEmptyOrTable();
  });

  test("CTA-RC-EU-002 @medium @cta — Agent filter selectable", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await recordings.selectAgentFilter("All agents");
    await recordings.expectHasRecordings();
  });
});
