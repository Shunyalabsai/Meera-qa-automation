/** Ensure Playwright baseURL keeps the /vap basename (trailing slash required). */
export function normalizeBaseUrl(url: string): string {
  return url.replace(/\/?$/, "/");
}

/**
 * App route relative to baseURL.
 * Use "agents" not "/agents" — a leading slash drops the /vap basename.
 */
export function appPath(route = ""): string {
  const trimmed = route.replace(/^\//, "");
  return trimmed ? `${trimmed}` : "";
}
