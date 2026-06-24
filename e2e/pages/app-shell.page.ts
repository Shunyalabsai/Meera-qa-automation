import { Page, expect } from "@playwright/test";
import { gotoApp } from "../helpers/navigate";

export class AppShellPage {
  constructor(protected readonly page: Page) {}

  navLink(name: string | RegExp) {
    return this.page.getByRole("link", { name });
  }

  async openRoute(route: string, heading: string | RegExp) {
    await gotoApp(this.page, route);
    await expect(this.page.getByRole("heading", { name: heading })).toBeVisible({
      timeout: 30_000,
    });
  }

  async signOut() {
    await this.page.getByRole("button", { name: /open user/i }).click();
    await this.page.getByRole("menuitem", { name: /sign out|log out/i }).click();
  }
}
