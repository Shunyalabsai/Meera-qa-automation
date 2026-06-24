import { Page } from "@playwright/test";
import { RecordingsPage } from "../pages/recordings.page";

export async function openRecordings(page: Page): Promise<RecordingsPage> {
  const recordings = new RecordingsPage(page);
  await recordings.open();
  return recordings;
}

export async function isRecordingsEmptyState(page: Page): Promise<boolean> {
  const recordings = new RecordingsPage(page);
  await recordings.open();
  return recordings.isEmptyState();
}
