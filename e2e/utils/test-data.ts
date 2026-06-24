export function uniqueName(prefix: string): string {
  return `${prefix}_${Date.now()}`;
}

export function minimalAgent(name: string) {
  return { name, language: "en" };
}

export const INVALID_UUID = "00000000-0000-0000-0000-000000000000";
export const VALID_UUID = "12345678-1234-1234-1234-123456789abc";
export const XSS_PAYLOAD = '<script>alert("xss")</script>';
