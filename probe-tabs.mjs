import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.join(process.cwd(), ".env") });
function b64url(i){return Buffer.from(i).toString("base64").replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");}
const raw=process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const creds=raw.trim().startsWith("{")?JSON.parse(raw):JSON.parse(fs.readFileSync(path.resolve(process.cwd(),raw),"utf8"));
const now=Math.floor(Date.now()/1000);
const header=b64url(JSON.stringify({alg:"RS256",typ:"JWT"}));
const payload=b64url(JSON.stringify({iss:creds.client_email,scope:"https://www.googleapis.com/auth/spreadsheets.readonly",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600}));
const si=`${header}.${payload}`;
const sign=crypto.sign("RSA-SHA256",Buffer.from(si),creds.private_key);
const jwt=`${si}.${b64url(sign)}`;
const res=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt})});
const token=(await res.json()).access_token;
const id="1V56bydTla54TIyYX4pdlDnUtRaN76oiVK24o6ZOQOaM";
const meta=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}?fields=sheets.properties(title,sheetId)`,{headers:{Authorization:`Bearer ${token}`}});
const j=await meta.json();
for(const s of j.sheets){
  const t=s.properties.title;
  console.log(`sheetId=${s.properties.sheetId} name=${JSON.stringify(t)} charcodes=${t.split("").slice(0,3).map(c=>c.charCodeAt(0)).join(",")}`);
}
// try ranges for the voice tab by sheetId via batchGet with grid range
const testRange = "' Voice Call / Telephony - Playground'!A1:G3";
const enc = encodeURIComponent(testRange);
const r2 = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${enc}?valueRenderOption=FORMATTED_VALUE`,{headers:{Authorization:`Bearer ${token}`}});
console.log("quoted-leading-space status:", r2.status);
console.log((await r2.text()).slice(0,200));
