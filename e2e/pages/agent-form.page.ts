import { Page, expect, Locator } from "@playwright/test";
import type {
  AccentOption,
  AgentGenderOption,
  LanguageOption,
  VoiceToneOption,
} from "../data/agent-form-options";
import {
  ACCENT_OPTIONS,
  AGENT_GENDER_OPTIONS,
  LANGUAGE_OPTIONS,
  VOICE_TONE_OPTIONS,
} from "../data/agent-form-options";

export type AgentFormTab =
  | "Prompt"
  | "Behaviour"
  | "Recording"
  | "Outcomes"
  | "Advanced";

export type DebtRecoveryAgentConfig = {
  name: string;
  description?: string;
  language?: LanguageOption;
  voiceTone?: VoiceToneOption;
  accent?: AccentOption;
  gender?: AgentGenderOption;
  systemPrompt?: string;
  firstMessage?: string;
  goodbyeMessage?: string;
  silenceTimeoutSecs?: number;
  maxCallDurationSecs?: number;
  bargeIn?: boolean;
  voicemailEnabled?: boolean;
  voicemailMessage?: string;
  idleRepromptMessage?: string;
  idleMaxRetries?: number;
  idleTerminateMessage?: string;
  recordCalls?: boolean;
  escalationEnabled?: boolean;
  transferTarget?: string;
  extractionSchema?: string;
  temperature?: number;
  maxTokens?: number;
  preCallApiEnabled?: boolean;
  preCallApiUrl?: string;
  preCallApiMethod?: "POST" | "GET";
};

export class AgentFormPage {
  constructor(private readonly page: Page) {}

  readonly tabs: AgentFormTab[] = [
    "Prompt",
    "Behaviour",
    "Recording",
    "Outcomes",
    "Advanced",
  ];

  async ensureFormReady() {
    await expect(this.page.getByRole("tab", { name: "Prompt" })).toBeVisible({
      timeout: 30_000,
    });
  }

  async expectNewAgentHeader() {
    await expect(
      this.page.getByRole("heading", { name: /New agent/i }),
    ).toBeVisible();
    await expect(
      this.page.getByText(/pipeline type locks everything else/i),
    ).toBeVisible();
  }

  tab(name: AgentFormTab) {
    return this.page.getByRole("tab", { name });
  }

  async openTab(name: AgentFormTab) {
    await this.tab(name).click();
    await expect(this.tab(name)).toHaveAttribute("aria-selected", "true");
  }

  async expectAllTabsVisible() {
    for (const t of this.tabs) {
      await expect(this.tab(t)).toBeVisible();
    }
  }

  // ── Field locators ─────────────────────────────────────────────────

  nameInput() {
    return this.page
      .getByLabel(/^Name\*?$/i)
      .or(this.page.getByRole("textbox", { name: /^Name/i }))
      .or(this.page.locator('input[name="name"]'));
  }

  descriptionInput() {
    return this.page
      .getByLabel(/^Description/i)
      .or(
        this.page
          .locator("textarea")
          .filter({ has: this.page.getByText(/^Description$/i) })
          .first(),
      );
  }

  selectByLabel(label: RegExp | string) {
    const pattern = typeof label === "string" ? label : label.source.replace(/[\^$]/g, "");
    const re = new RegExp(`^${pattern}`, "i");
    return this.page
      .getByRole("combobox", { name: re })
      .or(
        this.page
          .locator("label")
          .filter({ hasText: re })
          .locator("select")
          .first(),
      );
  }

  languageSelect() {
    return this.selectByLabel(/^Language$/i);
  }

  voiceToneSelect() {
    return this.selectByLabel(/^Voice tone$/i);
  }

  accentSelect() {
    return this.selectByLabel(/^Accent$/i);
  }

  genderSelect() {
    return this.selectByLabel(/^Agent gender$/i);
  }

  systemPromptInput() {
    return this.page
      .getByRole("textbox", { name: /^Instructions/i })
      .or(this.page.getByLabel(/^Instructions\*?$/i))
      .or(this.page.getByLabel(/Instructions \(read-only/i))
      .or(this.page.locator("textarea").filter({ hasText: /system/i }).first());
  }

  firstMessageInput() {
    return this.page
      .getByLabel(/First message/i)
      .or(this.page.locator('textarea').nth(0));
  }

  goodbyeMessageInput() {
    return this.page.getByLabel(/Goodbye message/i).first();
  }

  speechSpeedSlider() {
    return this.page.locator('input[type="range"]').first();
  }

  numberInputByLabel(label: RegExp) {
    return this.page
      .getByRole("spinbutton", { name: label })
      .or(
        this.page
          .locator("label")
          .filter({ hasText: label })
          .locator('input[type="number"]')
          .first(),
      );
  }

  checkboxByLabel(label: RegExp | string) {
    const pattern = typeof label === "string" ? label : label.source;
    return this.page.getByRole("checkbox", { name: new RegExp(pattern, "i") });
  }

  extractionSchemaTextarea() {
    return this.page
      .locator("textarea")
      .filter({ has: this.page.locator("xpath=ancestor::div[contains(., 'Custom extraction')]") })
      .first()
      .or(
        this.page.locator('[class*="font-mono"]').filter({ hasText: /buyingIntent|^\s*\{/ }).first(),
      );
  }

  createAgentButton() {
    return this.page.getByRole("button", { name: /^Create agent$/i });
  }

  saveChangesButton() {
    return this.page.getByRole("button", { name: /^Save changes$/i });
  }

  submitButton() {
    return this.page
      .getByRole("button", { name: /^Create agent$|^Save changes$/i });
  }

  async expectEditHeader(agentName: string) {
    const escaped = agentName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const main = this.page.getByRole("main");
    await expect(
      main
        .getByRole("heading", {
          name: new RegExp(`Edit ${escaped}|^${escaped}$`, "i"),
        })
        .first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(this.saveChangesButton()).toBeVisible();
  }

  async saveAndWaitForDetail() {
    await this.saveChangesButton().click();
    await expect(this.page).toHaveURL(/\/agents\/[0-9a-f-]+(\/edit)?$/, {
      timeout: 45_000,
    });
  }

  customizeOutcomesButton() {
    return this.page.getByRole("button", {
      name: /Customise outcomes|Customize outcomes/i,
    });
  }

  addOutcomeButton() {
    return this.page.getByRole("button", { name: /Add outcome/i });
  }

  async clickCustomizeOutcomes() {
    await this.customizeOutcomesButton().click();
    await expect(this.addOutcomeButton()).toBeVisible({ timeout: 10_000 });
  }

  async clickAddOutcome() {
    await this.addOutcomeButton().click();
  }

  // ── Tab content assertions ─────────────────────────────────────────

  async expectPromptTabContent() {
    await expect(this.page.getByText(/^Pipeline$/i)).toBeVisible();
    await expect(this.page.getByText(/^Basic info$/i)).toBeVisible();
    await expect(this.page.getByText(/^System prompt$/i).first()).toBeVisible();
    await this.nameInput().waitFor({ state: "visible" });
    await expect(this.languageSelect()).toBeVisible();
    await expect(this.voiceToneSelect()).toBeVisible();
    await expect(this.accentSelect()).toBeVisible();
    await expect(this.genderSelect()).toBeVisible();
  }

  async expectBehaviourTabContent() {
    await expect(this.page.getByRole("heading", { name: /^Opening$/i })).toBeVisible();
    await expect(this.page.getByText(/Speech speed/i)).toBeVisible();
    await expect(this.page.getByLabel(/First message/i)).toBeVisible();
    await expect(
      this.page.getByRole("heading", { name: /Voicemail detection/i }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("heading", { name: /Silence handling/i }),
    ).toBeVisible();
    await expect(this.checkboxByLabel(/barge-in/i)).toBeVisible();
  }

  async expectRecordingTabContent() {
    await expect(this.page.getByText(/^Call recording$/i)).toBeVisible();
    await expect(
      this.page.getByText(/Record all calls for this agent/i),
    ).toBeVisible();
  }

  async expectOutcomesTabContent() {
    await expect(this.page.getByText(/^Call outcomes$/i)).toBeVisible();
    await expect(this.page.getByText(/Custom extraction fields/i)).toBeVisible();
    await expect(this.page.getByText(/^Escalation$/i)).toBeVisible();
    await expect(
      this.page.getByText(/resolved|callback_scheduled|platform defaults/i).first(),
    ).toBeVisible();
  }

  async expectAdvancedTabContent() {
    await expect(this.page.getByText(/Voice & model tuning/i).first()).toBeVisible();
    await expect(this.page.getByText(/Temperature/i).first()).toBeVisible();
    await expect(this.page.getByText(/Max response tokens/i).first()).toBeVisible();
    await expect(this.page.getByText(/Pre-call API/i).first()).toBeVisible();
  }

  // ── Dropdown helpers ─────────────────────────────────────────────

  async selectLanguage(value: LanguageOption) {
    await this.languageSelect().selectOption(value);
    await expect(this.languageSelect()).toHaveValue(value);
  }

  async selectVoiceTone(value: VoiceToneOption) {
    await this.voiceToneSelect().selectOption(value);
    await expect(this.voiceToneSelect()).toHaveValue(value);
  }

  async selectAccent(value: AccentOption) {
    await this.accentSelect().selectOption(value);
    await expect(this.accentSelect()).toHaveValue(value);
  }

  async selectGender(value: AgentGenderOption) {
    await this.genderSelect().selectOption(value);
    await expect(this.genderSelect()).toHaveValue(value);
  }

  async expectSelectOptions(select: Locator, options: readonly string[]) {
    const values = await select.locator("option").evaluateAll((opts) =>
      opts.map((o) => o.getAttribute("value")).filter(Boolean),
    );
    expect(values.sort()).toEqual([...options].sort());
    for (const opt of options) {
      await expect(select.locator(`option[value="${opt}"]`)).toHaveCount(1);
    }
  }

  /** Verify Language, Voice tone, Accent, Agent gender dropdowns exist with all options. */
  async expectAllPromptDropdownOptions() {
    await expect(this.languageSelect()).toBeVisible();
    await expect(this.voiceToneSelect()).toBeVisible();
    await expect(this.accentSelect()).toBeVisible();
    await expect(this.genderSelect()).toBeVisible();
    await this.expectSelectOptions(this.languageSelect(), LANGUAGE_OPTIONS);
    await this.expectSelectOptions(this.voiceToneSelect(), VOICE_TONE_OPTIONS);
    await this.expectSelectOptions(this.accentSelect(), ACCENT_OPTIONS);
    await this.expectSelectOptions(this.genderSelect(), AGENT_GENDER_OPTIONS);
  }

  /** Cycle every option in all four Prompt-tab dropdowns. */
  async exerciseAllPromptDropdowns() {
    for (const lang of LANGUAGE_OPTIONS) await this.selectLanguage(lang);
    for (const tone of VOICE_TONE_OPTIONS) await this.selectVoiceTone(tone);
    for (const accent of ACCENT_OPTIONS) await this.selectAccent(accent);
    for (const gender of AGENT_GENDER_OPTIONS) await this.selectGender(gender);
  }

  // ── Fill full config (debt recovery journey) ─────────────────────

  async fillDebtRecoveryConfig(config: DebtRecoveryAgentConfig) {
    await this.nameInput().fill(config.name);
    if (config.description) {
      await this.descriptionInput().fill(config.description);
    }
    if (config.language) await this.selectLanguage(config.language);
    if (config.voiceTone) await this.selectVoiceTone(config.voiceTone);
    if (config.accent) await this.selectAccent(config.accent);
    if (config.gender) await this.selectGender(config.gender);
    if (config.systemPrompt) {
      const prompt = this.systemPromptInput();
      if (await prompt.isEditable({ timeout: 2_000 }).catch(() => false)) {
        await prompt.fill(config.systemPrompt);
      }
    }
  }

  async fillBehaviourFields(config: DebtRecoveryAgentConfig) {
    if (config.firstMessage) {
      await this.page.getByLabel(/First message/i).fill(config.firstMessage);
    }
    if (config.goodbyeMessage) {
      const goodbye = this.goodbyeMessageInput();
      if (await goodbye.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await goodbye.fill(config.goodbyeMessage);
      }
    }
    if (config.silenceTimeoutSecs !== undefined) {
      await this.numberInputByLabel(/Silence timeout/i).fill(
        String(config.silenceTimeoutSecs),
      );
    }
    if (config.maxCallDurationSecs !== undefined) {
      await this.numberInputByLabel(/Max call duration/i).fill(
        String(config.maxCallDurationSecs),
      );
    }
    if (config.bargeIn !== undefined) {
      const cb = this.checkboxByLabel(/barge-in/i);
      config.bargeIn ? await cb.check() : await cb.uncheck();
    }
    if (config.voicemailEnabled) {
      await this.checkboxByLabel(/Detect voicemail/i).check();
      if (config.voicemailMessage) {
        await this.page
          .getByLabel(/Voicemail message/i)
          .fill(config.voicemailMessage);
      }
    }
    if (config.idleRepromptMessage) {
      await this.page
        .getByLabel(/Re-prompt message/i)
        .fill(config.idleRepromptMessage);
    }
    if (config.idleMaxRetries !== undefined) {
      await this.numberInputByLabel(/Max retries/i).fill(
        String(config.idleMaxRetries),
      );
    }
    if (config.idleTerminateMessage) {
      await this.page
        .getByRole("textbox", { name: /^Closing line/i })
        .fill(config.idleTerminateMessage);
    }
  }

  async fillOutcomesFields(config: DebtRecoveryAgentConfig) {
    if (config.extractionSchema) {
      const editor = this.page
        .locator("textarea.font-mono, textarea[class*='font-mono']")
        .last();
      await editor.fill(config.extractionSchema);
    }
    if (config.escalationEnabled) {
      await this.checkboxByLabel(/Enable escalation/i).check();
      if (config.transferTarget) {
        await this.page
          .getByLabel(/Handoff target/i)
          .fill(config.transferTarget);
      }
    }
  }

  async fillAdvancedFields(config: DebtRecoveryAgentConfig) {
    if (config.temperature !== undefined) {
      await this.numberInputByLabel(/Temperature/i).fill(
        String(config.temperature),
      );
    }
    if (config.maxTokens !== undefined) {
      await this.numberInputByLabel(/Max response tokens/i).fill(
        String(config.maxTokens),
      );
    }
    if (config.preCallApiEnabled) {
      await this.checkboxByLabel(/Enable pre-call enrichment/i).check();
      if (config.preCallApiUrl) {
        await this.page.getByLabel(/Endpoint URL/i).fill(config.preCallApiUrl);
      }
      if (config.preCallApiMethod) {
        await this.selectByLabel(/^HTTP method$/i).selectOption(
          config.preCallApiMethod,
        );
      }
    }
  }

  async fillRecordingFields(config: DebtRecoveryAgentConfig) {
    if (config.recordCalls !== undefined) {
      const cb = this.checkboxByLabel(/Record all calls/i);
      config.recordCalls ? await cb.check() : await cb.uncheck();
    }
  }

  async createAgent(input: { name: string; language?: string }) {
    await this.ensureFormReady();
    await this.nameInput().fill(input.name);
    if (input.language) {
      await this.selectLanguage(input.language as LanguageOption);
    }
    await this.createAgentButton().click();
  }

  async submitEmpty() {
    await this.ensureFormReady();
    await this.nameInput().clear();
    await this.createAgentButton().click();
  }

  async fillLongName(length: number) {
    await this.ensureFormReady();
    await this.nameInput().fill("A".repeat(length));
  }

  async expectCreated(name: string) {
    await expect(this.page.getByText(name)).toBeVisible({ timeout: 30_000 });
  }

  async expectNameRequiredError() {
    await this.expectCreateSaveBlocked({
      field: this.nameInput(),
      errorPattern: /name.*required|required.*name|Fix the highlighted|Name is required/i,
    });
  }

  async expectValidationError(pattern: RegExp) {
    await expect(this.page.getByText(pattern)).toBeVisible({ timeout: 10_000 });
  }

  async submitCreate() {
    await this.createAgentButton().click();
  }

  /** Wait for in-flight create/save spinner before asserting validation state. */
  async waitForSaveSettled(timeout = 20_000) {
    const saving = this.page
      .getByRole("button", { name: /Saving/i })
      .or(this.page.getByText(/Saving your changes/i));
    if (await saving.first().isVisible({ timeout: 2_000 }).catch(() => false)) {
      await expect(saving.first()).not.toBeVisible({ timeout });
    }
  }

  /** Assert create did not succeed — visible banner, field error, or HTML5 :invalid. */
  async expectCreateSaveBlocked(options?: {
    field?: Locator;
    errorPattern?: RegExp;
  }) {
    await this.waitForSaveSettled();

    await expect(this.page).toHaveURL(/\/agents\/new/, { timeout: 10_000 });
    await expect(
      this.page.getByRole("heading", { name: /saved|successfully/i }),
    ).not.toBeVisible({ timeout: 5_000 });

    const pattern =
      options?.errorPattern ??
      /Fix the highlighted|Couldn't save|required|invalid|Name is required|First message/i;
    const visible = await this.page
      .getByText(pattern)
      .first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false);
    if (visible) return;

    if (options?.field) {
      const invalid = await options.field.evaluate(
        (el: HTMLInputElement | HTMLTextAreaElement) => !el.validity.valid,
      );
      if (invalid) return;
      if ((await options.field.getAttribute("aria-invalid")) === "true") return;
    }

    if ((await this.page.locator(":invalid").count()) > 0) return;

    await expect(this.createAgentButton()).toBeVisible({ timeout: 5_000 });
  }

  async expectWhitespaceNameBlocked() {
    await this.expectCreateSaveBlocked({
      field: this.nameInput(),
      errorPattern:
        /name|required|Fix the highlighted|trim|whitespace|too short|invalid/i,
    });
  }

  firstMessageInput() {
    return this.page.getByRole("textbox", { name: /^First message/i });
  }

  /** Assert form stayed on create page with a validation banner or field error. */
  async expectSaveBlocked(
    pattern = /Fix the highlighted|Couldn't save|required|invalid|First message/i,
  ) {
    await this.expectCreateSaveBlocked({ errorPattern: pattern });
  }

  async ensureFirstMessage(text = "Hello, this is a test call.") {
    await this.openTab("Behaviour");
    await this.page.getByLabel(/First message/i).fill(text);
    await this.openTab("Prompt");
  }

  extractionSchemaEditor() {
    return this.page
      .locator("textarea.font-mono, textarea[class*='font-mono']")
      .last();
  }

  async fillNameForSubmit(name: string) {
    await this.nameInput().fill(name);
    await this.openTab("Behaviour");
    const firstMessage = await this.page.getByLabel(/First message/i).inputValue();
    if (!firstMessage.trim()) {
      await this.page
        .getByLabel(/First message/i)
        .fill("Hello, this is a test call.");
    }
    await this.openTab("Prompt");
  }
}
