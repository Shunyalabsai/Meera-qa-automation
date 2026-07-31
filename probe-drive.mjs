#!/usr/bin/env node
/** Feasibility test: service-account Drive upload → public permission → IMAGE()-ready URL. Creates a tiny file, then deletes it. */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env") });

function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

const creds = (() => {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  return raw.trim().startsWith("{") ? JSON.parse(raw) : JSON.parse(fs.readFileSync(path.resolve(process.cwd(), raw), "utf8"));
})();

async function getToken(scope) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({
    iss: creds.client_email, scope, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  }));
  const signInput = `${header}.${payload}`;
  const sign = crypto.sign("RSA-SHA256", Buffer.from(signInput), creds.private_key);
  const jwt = `${signInput}.${b64url(sign)}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  if (!res.ok) throw new Error(`token failed ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

// 1x1 red PNG
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

try {
  const token = await getToken("https://www.googleapis.com/auth/drive.file");
  const up = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/related; boundary=probe",
    },
    body: `--probe\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{"name":"probe-img.png","mimeType":"image/png"}\r\n--probe\r\nContent-Type: image/png\r\n\r\n${png.toString("binary")}\r\n--probe--`,
  });
  const created = await up.json();
  if (!up.ok) { console.log("UPLOAD FAILED:", up.status, JSON.stringify(created)); process.exit(1); }
  const fileId = created.id;
  console.log("upload OK, fileId:", fileId);

  const perm = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });
  console.log("permission set:", perm.ok ? "OK (anyone with link)" : `FAIL ${perm.status} ${await perm.text()}`);

  const meta = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=webContentLink`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const m = await meta.json();
  console.log("webContentLink:", m.webContentLink);
  console.log("IMAGE-ready URL: https://drive.google.com/uc?id=" + fileId);

  // verify the public URL serves the image (no auth)
  const probe = await fetch("https://drive.google.com/uc?id=" + fileId);
  console.log("public GET:", probe.status, probe.headers.get("content-type"));

  // cleanup
  const del = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: "DELETE", headers: { Authorization: `Bearer ${token}` },
  });
  console.log("cleanup delete:", del.ok ? "OK" : `FAIL ${del.status}`);
} catch (e) {
  console.log("EXCEPTION:", e.message);
  process.exit(1);
}
