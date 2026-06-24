/**
 * Stable E2E fixtures — deterministic values only.
 * Do not use UI placeholder copy, demo secrets, or personal account data here.
 */

/** RFC 2606 reserved domain — never resolves; safe for URL field tests. */
export const E2E_HTTPS_URL = "https://e2e-webhook.test.invalid/hook";

/** Minimum 16 characters for webhook secret validation (matches UI label). */
export const E2E_WEBHOOK_SECRET_MIN_LENGTH = 16;

export const E2E_WEBHOOK_SECRET = "e2e-webhook-secret-16";

export const E2E_INVALID_URL = "not-a-valid-url";

export const E2E_SHORT_SECRET = "short";

export const E2E_CUSTOM_EVENT_TYPE = "e2e.test.event";

export const E2E_INTERNAL_IP_URL = "http://169.254.169.254/hook";

export const E2E_LANGUAGE_STORAGE_KEY = "shunya_lang";

export const E2E_DEFAULT_LANGUAGE = "en";
