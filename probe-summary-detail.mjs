import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: "/Users/unitedwecare/Meera_repo/.env" });
function b64url(i){return Buffer.from(i).toString("base64").replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");}
const raw=process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const creds=raw.trim().startsWith("{")?JSON.parse(raw):JSON.parse(fs.readFileSync(path.resolve(process.cwd(),raw),"utf8"));
const now=Math.floor(Date.now()/1000);
const h=b64url(JSON.stringify({alg:"RS256",typ:"JWT"}));
const p=b64url(JSON.stringify({iss:creds.client_email,scope:"https://www.googleapis.com/auth/spreadsheets.readonly",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600}));
const si=`${h}.${p}`;
const s=crypto.sign("RSA-SHA256",Buffer.from(si),creds.private_key);
const res=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:`${si}.${b64url(s)}`})});
const tok=(await res.json()).access_token;
const id=process.env.GOOGLE_RESULTS_SHEET_ID;
const tab="Summary";
const range=`'${tab}'!A1:N30`;
for (const render of ["FORMATTED_VALUE","RAW"]){
  const r=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(range)}?valueRenderOption=${render}`,{headers:{Authorization:`Bearer ${tok}`}});
  const j=await r.json();
  console.log(`\n===== ${render} =====`);
  (j.values??[]).forEach((row,i)=>{ console.log(String(i+1).padStart(2)+": "+JSON.stringify(row.map(c=>String(c).slice(0,60)))); });
}
