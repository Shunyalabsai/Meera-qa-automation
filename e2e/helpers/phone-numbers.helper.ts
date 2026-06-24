import { Page } from "@playwright/test";
import { PhoneNumbersPage } from "../pages/phone-numbers.page";

export async function openPhoneNumbers(page: Page): Promise<PhoneNumbersPage> {
  const phoneNumbers = new PhoneNumbersPage(page);
  await phoneNumbers.open();
  return phoneNumbers;
}

export async function openAddNumberModal(page: Page): Promise<PhoneNumbersPage> {
  const phoneNumbers = await openPhoneNumbers(page);
  await phoneNumbers.clickAddNumber();
  return phoneNumbers;
}

export async function isPhoneNumbersEmptyState(page: Page): Promise<boolean> {
  const phoneNumbers = new PhoneNumbersPage(page);
  await phoneNumbers.open();
  return phoneNumbers.isEmptyState();
}
