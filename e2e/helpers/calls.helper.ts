import { Page, type TestInfo } from "@playwright/test";
import { CallsListPage } from "../pages/calls-list.page";
import { skipEnvPrecondition } from "./skip";
import { STAGING_EMPTY_SKIP } from "./staging-profile";

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

/** Skip when Calls list has records (existing-user staging profile). */
export async function skipUnlessCallsEmpty(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (!(await isCallsEmptyState(page))) {
    skipEnvPrecondition(testInfo, STAGING_EMPTY_SKIP.calls);
  }
}
