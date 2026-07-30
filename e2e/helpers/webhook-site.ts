/**
 * webhook.site helpers — verify that the platform actually delivered an
 * outbound webhook to the endpoint configured in .env (Webhook_url).
 *
 * webhook.site exposes a simple REST API for the inbox behind a token:
 *   GET    https://webhook.site/token/{id}/requests   → received requests
 *   DELETE https://webhook.site/token/{id}/request    → clear the inbox
 */

export interface WebhookSiteRequest {
  uuid: string;
  method: string;
  url: string;
  created_at: string;
  content: string;
  headers: Record<string, string[] | string>;
}

const API_BASE = "https://webhook.site";

/** Extract the inbox token from any webhook.site URL form. */
export function webhookSiteToken(url: string): string | null {
  const match = url.match(
    /webhook\.site\/(?:#!\/(?:view\/)?)?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  );
  return match ? match[1] : null;
}

export function isWebhookSiteUrl(url: string): boolean {
  return webhookSiteToken(url) !== null;
}

export async function getWebhookSiteRequests(
  token: string,
): Promise<WebhookSiteRequest[]> {
  const res = await fetch(
    `${API_BASE}/token/${token}/requests?sorting=newest&per_page=50`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: WebhookSiteRequest[] };
  return json.data ?? [];
}

export async function clearWebhookSiteRequests(token: string): Promise<void> {
  await fetch(`${API_BASE}/token/${token}/request`, { method: "DELETE" }).catch(
    () => undefined,
  );
}

/**
 * Poll until a new delivery (beyond `sinceCount`) lands, or timeout.
 * Returns the full list (newest first); empty when nothing arrived in time.
 */
export async function waitForWebhookSiteDelivery(
  token: string,
  opts: { sinceCount?: number; timeoutMs?: number; intervalMs?: number } = {},
): Promise<WebhookSiteRequest[]> {
  const sinceCount = opts.sinceCount ?? 0;
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const intervalMs = opts.intervalMs ?? 3_000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const requests = await getWebhookSiteRequests(token);
    if (requests.length > sinceCount) return requests;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return [];
}
