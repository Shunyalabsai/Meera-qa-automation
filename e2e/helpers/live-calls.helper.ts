import { Page } from "@playwright/test";
import { LiveCallsPage } from "../pages/live-calls.page";

export async function openLiveCalls(page: Page): Promise<LiveCallsPage> {
  const liveCalls = new LiveCallsPage(page);
  await liveCalls.open();
  return liveCalls;
}

export async function isLiveCallsEmptyState(page: Page): Promise<boolean> {
  const liveCalls = new LiveCallsPage(page);
  await liveCalls.open();
  return liveCalls.isEmptyState();
}
