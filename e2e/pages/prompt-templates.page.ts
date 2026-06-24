import { Page, expect, Locator } from "@playwright/test";
import { gotoApp } from "../helpers/navigate";
import type { ExpectedVariableInput } from "../data/prompt-template-data";

/** BUILD › Prompt Templates — list and create form. */
export class PromptTemplatesPage {
  constructor(private readonly page: Page) {}

  async open() {
    await gotoApp(this.page, "prompts");
    await this.expectListHeader();
  }

  async expectListHeader() {
    await expect(
      this.page.getByRole("heading", { name: /Prompt Templates/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      this.page.getByText(/Reusable system prompts|branching version history/i).first(),
    ).toBeVisible();
  }

  async isEmptyState(): Promise<boolean> {
    return this.page
      .getByText(/No prompt templates yet/i)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
  }

  async expectEmptyState() {
    await this.expectListHeader();
    await expect(
      this.page.getByText(/No prompt templates yet/i),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      this.page.getByText(/Create one to reuse across agents/i),
    ).toBeVisible();
    await expect(this.newTemplateButton()).toBeVisible();
  }

  newTemplateButton(): Locator {
    return this.page.getByRole("button", { name: /New template/i });
  }

  async clickNewTemplate() {
    await this.newTemplateButton().click();
    await this.expectCreateForm();
  }

  async expectCreateForm() {
    await expect(this.nameInput()).toBeVisible({ timeout: 15_000 });
    await expect(this.basePromptInput()).toBeVisible();
    await expect(this.createButton()).toBeVisible();
    await expect(this.cancelButton()).toBeVisible();
  }

  nameInput(): Locator {
    return this.page
      .getByLabel(/^Name$/i)
      .or(this.page.getByPlaceholder(/welcome-flow/i));
  }

  categoryInput(): Locator {
    return this.page
      .getByLabel(/^Category$/i)
      .or(this.page.getByPlaceholder(/^support$/i));
  }

  descriptionInput(): Locator {
    return this.page.getByLabel(/^Description$/i);
  }

  basePromptInput(): Locator {
    return this.page
      .getByLabel(/Base prompt/i)
      .or(
        this.page
          .locator("textarea")
          .filter({ has: this.page.getByText(/Base prompt/i) })
          .first(),
      )
      .or(this.page.locator("textarea").nth(0));
  }

  addVariableButton(): Locator {
    // Accessible name is the full "Expected variables (optional) …" label; visible text is "+ Add variable".
    return this.page
      .locator("main")
      .getByRole("button")
      .filter({ hasText: /Add variable/i })
      .first();
  }

  variableRows(): Locator {
    return this.page.locator(
      '[data-testid="expected-variable-row"], form >> text=/field_name|snake_case/i >> xpath=ancestor::div[contains(@class,"grid") or contains(@class,"flex")][1]',
    );
  }

  variableFieldNameInputs(): Locator {
    return this.page
      .getByPlaceholder(/field_name|snake_case/i)
      .or(this.page.getByLabel(/field_name/i));
  }

  variableDescriptionInputs(): Locator {
    return this.page
      .getByPlaceholder(/description.*CSV|shown in CSV/i)
      .or(this.page.getByLabel(/description.*CSV|shown in CSV/i));
  }

  variableRequiredCheckboxes(): Locator {
    return this.page.getByRole("checkbox", { name: /^required$/i });
  }

  variableRemoveButtons(): Locator {
    return this.page
      .getByRole("button", { name: /^Remove$|^Delete$|^×$/i })
      .or(this.page.locator('button[aria-label*="Remove"], button[aria-label*="Delete"]'));
  }

  async addExpectedVariable(input: ExpectedVariableInput) {
    const rowsBefore = await this.variableFieldNameInputs().count();
    await this.addVariableButton().click();
    await expect(this.variableFieldNameInputs()).toHaveCount(rowsBefore + 1, {
      timeout: 10_000,
    });

    const fieldInput = this.variableFieldNameInputs().last();
    await fieldInput.fill(input.fieldName);

    if (input.description) {
      const desc = this.variableDescriptionInputs();
      if (await desc.last().isVisible({ timeout: 2_000 }).catch(() => false)) {
        await desc.last().fill(input.description);
      }
    }

    if (input.required) {
      const cb = this.variableRequiredCheckboxes().last();
      if (await cb.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await cb.check();
      }
    }
  }

  async removeLastVariable() {
    const inputs = this.variableFieldNameInputs();
    const before = await inputs.count();
    if (before === 0) return;

    const removeBtn = this.page
      .locator("main")
      .getByRole("button", { name: /^✕$|^×$/ });
    await expect(removeBtn.nth(before - 1)).toBeVisible({ timeout: 5_000 });
    await removeBtn.nth(before - 1).click();
    await expect(inputs).toHaveCount(before - 1, { timeout: 10_000 });
  }

  async expectVariableRowControls() {
    const field = this.variableFieldNameInputs().last();
    await expect(field).toBeVisible();
    await expect(field).toHaveAttribute(
      "placeholder",
      /field_name|snake_case/i,
    );
    await expect(this.variableRequiredCheckboxes().last()).toBeVisible();
    await expect(this.variableDescriptionInputs().last()).toBeVisible();
  }

  createButton(): Locator {
    return this.page.getByRole("button", { name: /^Create$/i });
  }

  cancelButton(): Locator {
    return this.page
      .getByRole("button", { name: /^Cancel$/i })
      .first();
  }

  async fillCreateForm(input: {
    name: string;
    category?: string;
    description?: string;
    basePrompt: string;
    variables?: ExpectedVariableInput[];
  }) {
    await this.nameInput().fill(input.name);
    if (input.category) await this.categoryInput().fill(input.category);
    if (input.description) {
      const desc = this.descriptionInput();
      if (await desc.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await desc.fill(input.description);
      }
    }
    await this.basePromptInput().fill(input.basePrompt);
    if (input.variables) {
      for (const v of input.variables) {
        await this.addExpectedVariable(v);
      }
    }
  }

  async submitCreate() {
    await this.createButton().click();
  }

  async cancelCreate() {
    await this.cancelButton().click();
  }

  async expectVariableGuide() {
    await expect(
      this.page.getByText(/How to reference variables|single-brace|\{variable_name\}/i).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText(/\{customer_name\}|\{order_id\}/i).first(),
    ).toBeVisible();
  }

  async expectExpectedVariablesSection() {
    await expect(this.page.getByText(/Expected variables/i).first()).toBeVisible();
    await expect(this.addVariableButton()).toBeVisible();
    await expect(
      this.page.getByText(/Declare the CSV columns|CSV with these headers/i).first(),
    ).toBeVisible();
  }

  async expectTemplateVisible(name: string) {
    await expect(this.page.getByText(name, { exact: false })).toBeVisible({
      timeout: 30_000,
    });
  }

  async expectCreateBlocked() {
    await expect(this.page).toHaveURL(/\/prompts/, { timeout: 5_000 });
    await expect(this.createButton()).toBeVisible();
  }

  templateRow(name: string): Locator {
    return this.page
      .locator("li, tr, article, [class*='card']")
      .filter({ hasText: name })
      .first();
  }

  async deleteTemplate(name: string) {
    const row = this.templateRow(name);
    this.page.once("dialog", (d) => d.accept());
    const deleteBtn = row.getByRole("button", { name: /Delete/i });
    if (await deleteBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await deleteBtn.click();
      await expect(this.page.getByText(name, { exact: false })).not.toBeVisible({
        timeout: 15_000,
      });
    }
  }
}
