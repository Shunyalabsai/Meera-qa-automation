import { test, expect } from "@playwright/test";
import { openRecordings } from "../../../../../helpers/recordings.helper";
import { RECORDINGS_COPY, RECORDINGS_SAMPLES } from "../../../../../data/recordings-data";
import { INVALID_UUID, XSS_PAYLOAD } from "../../../../../utils/test-data";

test.describe("ANALYZE › Recordings — Negative @journey @existing-user @recordings @negative", () => {
  test("TC-RC-N101 @medium @negative — Invalid Call ID search shows no recordings", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await recordings.search(INVALID_UUID);
    await expect(page.getByText(RECORDINGS_COPY.emptyTitle).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("TC-RC-N102 @medium @negative — Nonsense search shows no recordings", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await recordings.search(RECORDINGS_SAMPLES.invalidSearch);
    await expect(page.getByText(RECORDINGS_COPY.emptyTitle).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("TC-RC-N103 @low @negative — Empty search does not break page", async ({
    page,
  }) => {
    const recordings = await openRecordings(page);
    await recordings.search("");
    await recordings.expectPageHeader();
    await recordings.expectEmptyOrTable();
  });

  test("TC-RC-N104 @low @negative — Invalid recordings sub-route handled gracefully", async ({
    page,
  }) => {
    await page.goto("/vap/recordings/this-id-does-not-exist");
    await expect(
      page
        .getByText(/404|not found|Recordings|No recordings found/i)
        .first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("TC-RC-N105 @medium @negative — XSS payload in search shows no crash", async ({
    page,
  }) => {
    const dialogs: string[] = [];
    page.on("dialog", (d) => {
      dialogs.push(d.message());
      d.dismiss();
    });

    const recordings = await openRecordings(page);
    await recordings.search(XSS_PAYLOAD);
    await recordings.expectPageHeader();
    await recordings.expectEmptyOrTable();
    expect(dialogs).toHaveLength(0);
    await expect(recordings.searchInput()).toHaveValue(XSS_PAYLOAD);
  });

});
