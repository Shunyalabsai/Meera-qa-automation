import { test } from "@playwright/test";
import { openRecordings } from "../../../../helpers/recordings.helper";
import { RECORDINGS_SAMPLES } from "../../../../data/recordings-data";
import { VALID_UUID } from "../../../../utils/test-data";

test.describe("ANALYZE › Recordings — Search @journey @new-user @recordings @positive", () => {
  test("TC-RC-020 @high @positive — Search by phone number shows empty or table", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await recordings.search(RECORDINGS_SAMPLES.phoneNumber);
    await recordings.expectEmptyOrTable();
  });

  test("TC-RC-021 @high @positive — Search by E.164 phone number", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await recordings.search(RECORDINGS_SAMPLES.e164Phone);
    await recordings.expectEmptyOrTable();
  });

  test("TC-RC-022 @high @positive — Search by Call ID UUID", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await recordings.search(VALID_UUID);
    await recordings.expectEmptyOrTable();
  });

});
