import type { QaCase } from "../data/qa-cases";

/** Map sheet Test Case Type / name to Playwright grep tags. */
export function tagsForCase(c: QaCase): string {
  const t = (c.type || "").toLowerCase();
  if (t.includes("negative")) return "@negative";
  if (t.includes("security")) return "@security @negative";
  if (t.includes("positive")) return "@positive";
  if (c.id.startsWith("TC-EC")) return "@edge";
  if (c.id.startsWith("TC-PF")) return "@performance @manual";
  if (c.id.startsWith("TC-SC")) return "@security @manual";
  return "@manual";
}

export function priorityTag(c: QaCase): string {
  const p = (c.priority || "medium").toLowerCase();
  if (p === "critical") return "@critical";
  if (p === "high") return "@high";
  if (p === "low") return "@low";
  return "@medium";
}
