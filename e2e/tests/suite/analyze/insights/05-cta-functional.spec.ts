import { test } from "@playwright/test";
import { openInsights } from "../../../../helpers/insights.helper";
import { INSIGHTS_DATE_PRESETS } from "../../../../data/insights-data";

test.describe("ANALYZE › Insights — CTA functional @insights @cta", () => {
  for (const preset of INSIGHTS_DATE_PRESETS) {
    test(`CTA-IS-${preset.replace(/\s/g, "")} @high @cta — ${preset} tab updates dashboard`, async ({
      page,
    }) => {
      const insights = await openInsights(page);
      await insights.clickDatePreset(preset);
      await insights.expectDashboardLayout();
    });
  }

  test("CTA-IS-Agent @medium @cta — All agents filter keeps dashboard stable", async ({
    page,
  }) => {
    const insights = await openInsights(page);
    await insights.selectAgentFilter("All agents");
    await insights.expectDashboardLayout();
  });
});
