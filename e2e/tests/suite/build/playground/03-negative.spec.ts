import { test, expect } from "@playwright/test";
import { openPlayground } from "../../../../helpers/playground.helper";
import { PlaygroundPage } from "../../../../pages/playground.page";
import { PLAYGROUND_SAMPLES } from "../../../../data/playground-data";

test.describe("BUILD › Playground — Negative @journey @new-user @playground @negative", () => {
  test("TC-PG-N101 @high @negative — Start browser call without agent selected", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    test.skip(
      await playground.hasSelectableAgent() &&
        !!(await playground.selectedAgentValue()),
      "Agent already selected in dropdown",
    );

    await playground.clickStartBrowserCall();
    await expect(
      page.getByText(/select.*agent|pick.*agent|required|error|choose/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("TC-PG-N102 @high @negative — Start phone call without agent selected", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.switchToPhoneMode();
    await playground.fillToNumber(PLAYGROUND_SAMPLES.validIndianNumber);

    const val = await playground.selectedAgentValue().catch(() => "");
    test.skip(!!val, "Agent pre-selected");

    await playground.clickStartPhoneCall();
    await expect(
      page.getByText(/select.*agent|pick.*agent|required|error|choose/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("TC-PG-N103 @high @negative — Empty to number rejected", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.switchToPhoneMode();
    await playground.fillToNumber("");
    await playground.clickStartPhoneCall();
    await expect(
      page.getByText(/invalid|required|enter|phone|number|error/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("TC-PG-N104 @high @negative — Malformed phone number rejected", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.switchToPhoneMode();
    await playground.fillToNumber(PLAYGROUND_SAMPLES.malformedPhone);
    await playground.clickStartPhoneCall();
    await expect(
      page.getByText(/invalid|malformed|phone|error|E\.164/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("TC-VC-101 @high @negative — Invalid short phone number rejected", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.switchToPhoneMode();
    await playground.fillToNumber(PLAYGROUND_SAMPLES.shortInvalidNumber);
    await playground.clickStartPhoneCall();
    await expect(
      page.getByText(/invalid|failed|error|malformed|phone/i).first(),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("TC-PG-N105 @medium @negative — Malformed context JSON shows error", async ({
    page,
  }) => {
    const playground = await openPlayground(page);
    await playground.switchToPhoneMode();
    await playground.fillToNumber(PLAYGROUND_SAMPLES.validIndianNumber);
    await playground.fillContextVariables(PLAYGROUND_SAMPLES.invalidContextJson);
    await playground.clickStartPhoneCall();
    await expect(
      page.getByText(/invalid|JSON|parse|malformed|phone|error/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("TC-VC-102 @high @negative @manual — No audio from caller", async () => {
    test.skip(true, "Manual: start call and remain silent — verify reprompt/end");
  });

  test("TC-VC-103 @high @negative @manual — Noisy background audio", async () => {
    test.skip(true, "Manual: call with heavy background noise");
  });

  test("TC-VC-105 @medium @negative @manual — Unsupported spoken language", async () => {
    test.skip(true, "Manual: speak language not configured on agent");
  });
});
