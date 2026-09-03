import { test, expect } from "@playwright/test";
import { RecordingsPage } from "../../../../pages/recordings.page";
import { isRecordingsEmptyState } from "../../../../helpers/recordings.helper";
import { RECORDINGS_COPY } from "../../../../data/recordings-data";

test.describe("ANALYZE › Recordings — Main UI @journey @new-user @recordings @smoke", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !(await isRecordingsEmptyState(page)),
      "Recordings exist — empty state not shown",
    );
  });

  test("TC-RC-003 @smoke @high @ui — Empty state shows No recordings found", async ({
    page,
  }) => {
    const recordings = new RecordingsPage(page);
    await recordings.expectEmptyState();
  });

  test("TC-RC-004 @high @ui — Search input and agent filter visible", async ({
    page,
  }) => {
    const recordings = new RecordingsPage(page);
    await recordings.open();
    await recordings.expectSearchAndFilterVisible();
    await expect(recordings.searchInput()).toHaveAttribute(
      "placeholder",
      RECORDINGS_COPY.searchPlaceholder,
    );
  });

  test("TC-RC-005 @medium @ui — Agent filter defaults to All agents", async ({
    page,
  }) => {
    const recordings = new RecordingsPage(page);
    await recordings.open();
    await recordings.expectAgentFilterDefault();
  });

  test("TC-RC-006 @medium @ui — Sidebar Recordings nav link visible", async ({
    page,
  }) => {
    const recordings = new RecordingsPage(page);
    await recordings.open();
    await expect(
      page.getByRole("link", { name: /^Recordings$/i }),
    ).toBeVisible();
  });
});
