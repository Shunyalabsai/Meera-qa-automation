import { Page, expect, Locator } from "@playwright/test";
import { gotoApp, waitForLoadingToClear } from "../helpers/navigate";
import { WHATSAPP_COPY, WHATSAPP_SAMPLES } from "../data/whatsapp-data";

/** SETTINGS / CHANNELS › WhatsApp Page Object Model */
export class WhatsAppPage {
  constructor(private readonly page: Page) {}

  mainPanel(): Locator {
    return this.page.getByRole("main");
  }

  async open() {
    await gotoApp(this.page, "admin/whatsapp");
    await waitForLoadingToClear(this.page);
  }

  async expectPageHeader() {
    await expect(
      this.page.getByRole("heading", { name: WHATSAPP_COPY.header }).first(),
    ).toBeVisible({ timeout: 15_000 });
  }

  wabaIdInput(): Locator {
    return this.mainPanel()
      .getByPlaceholder(/WABA ID|Business Account ID/i)
      .or(this.mainPanel().getByLabel(/WABA ID|Business Account ID/i))
      .first();
  }

  phoneNumberIdInput(): Locator {
    return this.mainPanel()
      .getByPlaceholder(/Phone Number ID/i)
      .or(this.mainPanel().getByLabel(/Phone Number ID/i))
      .first();
  }

  accessTokenInput(): Locator {
    return this.mainPanel()
      .getByPlaceholder(/Access Token|API Key/i)
      .or(this.mainPanel().getByLabel(/Access Token|API Key/i))
      .first();
  }

  webhookVerifyTokenInput(): Locator {
    return this.mainPanel()
      .getByPlaceholder(/Verify Token/i)
      .or(this.mainPanel().getByLabel(/Verify Token/i))
      .first();
  }

  saveCredentialsButton(): Locator {
    return this.mainPanel().getByRole("button", {
      name: /Save|Connect WhatsApp|Update Configuration/i,
    });
  }

  testRecipientInput(): Locator {
    return this.mainPanel()
      .getByPlaceholder(/\+1|Phone number|Recipient/i)
      .or(this.mainPanel().getByLabel(/Recipient Phone/i))
      .first();
  }

  testMessageBodyInput(): Locator {
    return this.mainPanel()
      .getByPlaceholder(/Message text|Type a message/i)
      .or(this.mainPanel().getByLabel(/Message Text/i))
      .first();
  }

  sendTestMessageButton(): Locator {
    return this.mainPanel().getByRole("button", {
      name: /Send test|Send message/i,
    });
  }

  syncTemplatesButton(): Locator {
    return this.mainPanel().getByRole("button", {
      name: /Sync templates|Fetch templates/i,
    });
  }

  templateDropdown(): Locator {
    return this.mainPanel()
      .getByRole("combobox", { name: /Template/i })
      .or(this.mainPanel().getByRole("button", { name: /Select template/i }))
      .first();
  }

  async fillCredentials(wabaId: string, phoneId: string, token: string) {
    if (await this.wabaIdInput().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.wabaIdInput().fill(wabaId);
    }
    if (await this.phoneNumberIdInput().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.phoneNumberIdInput().fill(phoneId);
    }
    if (await this.accessTokenInput().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.accessTokenInput().fill(token);
    }
  }

  async fillTestMessage(recipientPhone: string, messageBody: string) {
    if (await this.testRecipientInput().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.testRecipientInput().fill(recipientPhone);
    }
    if (await this.testMessageBodyInput().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.testMessageBodyInput().fill(messageBody);
    }
  }
}
