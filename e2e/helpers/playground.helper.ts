import { Page } from "@playwright/test";
import { PlaygroundPage } from "../pages/playground.page";

export async function openPlayground(page: Page): Promise<PlaygroundPage> {
  const playground = new PlaygroundPage(page);
  await playground.open();
  return playground;
}
