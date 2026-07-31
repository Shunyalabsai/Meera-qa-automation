import { Page, expect } from "@playwright/test";
import { gotoApp } from "./navigate";
import { AgentTemplatePage } from "../pages/agent-template.page";
import { AgentFormPage } from "../pages/agent-form.page";

/** Open /agents/new — returns template gallery if shown, else form. */
export async function gotoNewAgent(page: Page): Promise<void> {
  await gotoApp(page, "agents/new");
  await page.waitForURL(/\/agents\/new/, { timeout: 30_000 });
  await new AgentTemplatePage(page).waitForGalleryOrForm();
}

export async function openAgentFormFromScratch(page: Page): Promise<AgentFormPage> {
  const { form } = await openAgentFormForEntry(page, { kind: "scratch" });
  return form;
}

export async function openAgentFormForEntry(
  page: Page,
  entry: { kind: "template"; title: string } | { kind: "scratch" },
): Promise<{ form: AgentFormPage; galleryUsed: boolean }> {
  await gotoNewAgent(page);

  const gallery = new AgentTemplatePage(page);
  const onGallery = await page
    .getByRole("heading", { name: /What industry are you building for/i })
    .isVisible({ timeout: 2_000 })
    .catch(() => false);

  if (onGallery) {
    if (entry.kind === "scratch") {
      await gallery.startFromScratch();
    } else {
      await gallery.selectTemplate(entry.title);
    }
  }

  const form = new AgentFormPage(page);
  await form.ensureFormReady();
  return { form, galleryUsed: onGallery };
}

export async function openAgentFormViaTemplate(
  page: Page,
  templateTitle: string,
): Promise<AgentFormPage> {
  const { form } = await openAgentFormForEntry(page, {
    kind: "template",
    title: templateTitle,
  });
  return form;
}

/** Opens /agents/new and selects the Credit Card Payment Reminder template card. */
export async function openCreditCardPaymentReminderAgentForm(
  page: Page,
): Promise<AgentFormPage> {
  const { form } = await openAgentFormForEntry(page, {
    kind: "template",
    title: "Credit Card Payment Reminder",
  });
  return form;
}

/** Opens /agents/new and selects the Order Confirmation & Reschedule template card. */
export async function openOrderConfirmationRescheduleAgentForm(
  page: Page,
): Promise<AgentFormPage> {
  const { form } = await openAgentFormForEntry(page, {
    kind: "template",
    title: "Order Confirmation & Reschedule",
  });
  return form;
}

/** Opens /agents/new and selects the Appointment Reminder & Reschedule template card. */
export async function openAppointmentReminderRescheduleAgentForm(
  page: Page,
): Promise<AgentFormPage> {
  const { form } = await openAgentFormForEntry(page, {
    kind: "template",
    title: "Appointment Reminder & Reschedule",
  });
  return form;
}

/** Opens /agents/new and selects the Retention Call template card. */
export async function openRetentionCallAgentForm(
  page: Page,
): Promise<AgentFormPage> {
  const { form } = await openAgentFormForEntry(page, {
    kind: "template",
    title: "Retention Call",
  });
  return form;
}

/** Opens /agents/new via Start from scratch — blank agent form. */
export async function openStartFromScratchAgentForm(
  page: Page,
): Promise<AgentFormPage> {
  const { form } = await openAgentFormForEntry(page, { kind: "scratch" });
  return form;
}

export type MinimalAgentInput = {
  name: string;
  language?: string;
};

export async function createAgentViaUi(
  page: Page,
  input: MinimalAgentInput,
): Promise<void> {
  const form = await openAgentFormFromScratch(page);
  await form.createAgent(input);
  await waitForAgentCreated(page);
}

export async function gotoNewAgentForm(page: Page): Promise<void> {
  await openAgentFormFromScratch(page);
}

export async function isAgentFormVisible(page: Page): Promise<boolean> {
  return page.getByRole("tab", { name: "Prompt" }).isVisible({ timeout: 3_000 }).catch(() => false);
}

/** After Create agent — staging may redirect to /agents/:id or show a success screen on /agents/new. */
export async function waitForAgentCreated(
  page: Page,
  timeout = 45_000,
): Promise<string> {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const fromUrl = page.url().match(/\/agents\/([0-9a-f-]+)$/)?.[1];
    if (fromUrl) return fromUrl;

    const saved = await page
      .getByRole("heading", { name: /saved/i })
      .isVisible({ timeout: 500 })
      .catch(() => false);

    if (saved) {
      const detailsHref = await page
        .getByRole("link", { name: /View agent details/i })
        .getAttribute("href")
        .catch(() => null);
      const playgroundHref = await page
        .getByRole("link", { name: /Test in Playground/i })
        .getAttribute("href")
        .catch(() => null);
      const id =
        detailsHref?.match(/\/agents\/([0-9a-f-]+)/)?.[1] ??
        playgroundHref?.match(/agent_id=([0-9a-f-]+)/)?.[1];
      if (id) return id;
    }

    await page.waitForTimeout(500);
  }

  throw new Error(`Agent create did not complete: ${page.url()}`);
}
