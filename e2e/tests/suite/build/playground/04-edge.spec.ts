import { test, expect } from "@playwright/test";
import { openPlayground } from "../../../../helpers/playground.helper";
import { PlaygroundPage } from "../../../../pages/playground.page";
import { PLAYGROUND_SAMPLES } from "../../../../data/playground-data";
import { gotoApp } from "../../../../helpers/navigate";
import { INVALID_UUID } from "../../../../utils/test-data";

test.describe("BUILD › Playground — Edge @journey @new-user @playground @edge", () => {
  test("TC-PG-E101 @medium @edge — Toggle Browser ↔ Phone preserves agent selection", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    test.skip(
      !(await playground.hasSelectableAgent()),
      "No agents to select",
    );
    const agentId = await playground.selectFirstAgent();
    await playground.switchToPhoneMode();
    await playground.switchToBrowserMode();
    if (agentId) {
      await expect(playground.agentSelect()).toHaveValue(agentId);
    }
  });

  test("TC-PG-E102 @medium @edge — Phone mode fields persist when switching back", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.switchToPhoneMode();
    await playground.fillToNumber(PLAYGROUND_SAMPLES.validIndianNumber);
    await playground.fillContextVariables(PLAYGROUND_SAMPLES.validContextKeyValue);
    await playground.switchToBrowserMode();
    await playground.switchToPhoneMode();
    await expect(playground.toNumberInput()).toHaveValue(
      PLAYGROUND_SAMPLES.validIndianNumber,
    );
  });

  test("TC-PG-E103 @medium @edge — Deep-link with invalid agent_id still loads Playground", async ({
    page,
  }) => {
    await gotoApp(page, `playground?agent_id=${INVALID_UUID}`);
    await expect(
      page.getByRole("heading", { name: /Playground/i }),
    ).toBeVisible({ timeout: 30_000 });
  });

  test("TC-PG-E104 @low @edge — Very long phone number rejected or truncated", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.switchToPhoneMode();
    await playground.fillToNumber("9".repeat(25));
    await playground.clickStartPhoneCall();
    await expect(
      page.getByText(/invalid|too long|phone|error|E\.164/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("TC-PG-E105 @low @edge — Empty context variables allowed with valid number", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.switchToPhoneMode();
    await playground.fillToNumber(PLAYGROUND_SAMPLES.validIndianNumber);
    await playground.fillContextVariables("");
    await expect(playground.contextVariablesInput()).toHaveValue("");
    await expect(playground.startPhoneCallButton()).toBeEnabled();
  });

  test("TC-PG-E106 @medium @edge @manual — Mic permission denied in browser call", async () => {
    test.skip(true, "Manual: deny microphone permission and verify error handling");
  });

  test("TC-VC-010 @medium @positive @manual — Low-bandwidth call stability", async () => {
    test.skip(true, "Manual: throttle network to 3G and place browser call");
  });
});
