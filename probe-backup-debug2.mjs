#!/usr/bin/env node
/** Backup ALL tabs' values of the report sheet to a local JSON. */
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
const id=process.env.GOOGLE_RESULTS_SHEET_ID;
const meta=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}?fields=sheets.properties.title`,{headers:{Authorization:`Bearer ${token}`}});
const j=await meta.json(); console.log("sheets len:", j.sheets ? j.sheets.length : "none"); console.log("raw:", JSON.stringify(j).slice(0,200));
const backup={};
for(const s of j.sheets){
  const title=s.properties.title;
  const range=`'${title.replace(/'/g,"''")}'!A1:ZZ20000`;
  const res2=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(range)}?valueRenderOption=RAW`,{headers:{Authorization:`Bearer ${token}`}});
  const v=await res2.json();
  if(v.values) backup[title]=v.values;
}
const out="/tmp/report-sheet-backup.json";
fs.writeFileSync(out, JSON.stringify(backup));
let total=0; for(const t of Object.keys(backup)) total+=backup[t].length;
console.log(`Backed up ${Object.keys(backup).length} tab(s), ${total} rows → ${out}`);
