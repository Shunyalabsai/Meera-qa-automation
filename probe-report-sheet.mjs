#!/usr/bin/env node
/** Probe the report sheet: tab list + full Summary + first rows of result tabs. */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env") });
function b64url(i){return Buffer.from(i).toString("base64").replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");}
function loadCredentials(){
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (raw.trim().startsWith("{")) return JSON.parse(raw);
  return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), raw), "utf8"));
}
async function token(creds){
  const now=Math.floor(Date.now()/1000);
  const h=b64url(JSON.stringify({alg:"RS256",typ:"JWT"}));
  const p=b64url(JSON.stringify({iss:creds.client_email,scope:"https://www.googleapis.com/auth/spreadsheets.readonly",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600}));
  const si=`${h}.${p}`;
  const s=crypto.sign("RSA-SHA256",Buffer.from(si),creds.private_key);
  const res=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:`${si}.${b64url(s)}`})});
  return (await res.json()).access_token;
}
async function j(token,url){const r=await fetch(url,{headers:{Authorization:`Bearer ${token}`}});if(!r.ok)return{error:`${r.status} ${(await r.text()).slice(0,200)}`};return r.json();}

const creds=loadCredentials();
const tok=await token(creds);
const id=process.env.GOOGLE_RESULTS_SHEET_ID;

const meta=await j(tok,`https://sheets.googleapis.com/v4/spreadsheets/${id}?fields=sheets.properties.title`);
console.log("TABS:", (meta.sheets??[]).map(s=>s.properties.title).join(" | "));

for (const tab of ["Summary","ANALYZE","BUILD","RUN"]){
  const range=`'${tab.replace(/'/g,"''")}'!A1:M30`;
  const v=await j(tok,`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(range)}?valueRenderOption=FORMATTED_VALUE`);
  if (v.error){ console.log(`\n== ${tab}: ERROR ${v.error}`); continue; }
  console.log(`\n========== ${tab} (${(v.values??[]).length} rows) ==========`);
  for (const row of v.values??[]){
    console.log("  | "+row.map(c=>String(c??"").slice(0,36)).join(" | "));
  }
}
