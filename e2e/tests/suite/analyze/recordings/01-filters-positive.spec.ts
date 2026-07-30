import { test, expect } from "@playwright/test";
import { openRecordings } from "../../../../helpers/recordings.helper";

test.describe("ANALYZE › Recordings — Filters @journey @new-user @recordings @positive", () => {
  test("TC-RC-010 @high @positive — Page loads at /recordings", async ({
    page,
  }) => {
    await openRecordings(page);
    await expect(page).toHaveURL(/\/recordings/);
  });

  test("TC-RC-002 @medium @positive — Empty state or recordings table", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await recordings.expectEmptyOrTable();
  });

  test("TC-RC-011 @medium @positive — Agent filter shows All agents option", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await recordings.expectAgentFilterDefault();
  });

});
