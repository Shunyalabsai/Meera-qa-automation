import { Page } from "@playwright/test";
import { CallsListPage } from "../pages/calls-list.page";

export async function openCallsList(page: Page): Promise<CallsListPage> {
  const calls = new CallsListPage(page);
  await calls.open();
  return calls;
}

export async function isCallsEmptyState(page: Page): Promise<boolean> {
  const calls = new CallsListPage(page);
  await calls.open();
  return calls.isEmptyState();
}
