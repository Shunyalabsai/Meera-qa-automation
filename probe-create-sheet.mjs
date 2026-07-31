#!/usr/bin/env node
/** Create a throwaway spreadsheet for publish-testing; returns its ID. */
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
const payload=b64url(JSON.stringify({iss:creds.client_email,scope:"https://www.googleapis.com/auth/spreadsheets",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600}));
const si=`${header}.${payload}`;
const sign=crypto.sign("RSA-SHA256",Buffer.from(si),creds.private_key);
const jwt=`${si}.${b64url(sign)}`;
const res=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt})});
const token=(await res.json()).access_token;
const create=await fetch("https://sheets.googleapis.com/v4/spreadsheets",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({properties:{title:"THROWAWAY-report-format-test"}})});
const created=await create.json();
console.log("create status:", create.status);
console.log("create body:", JSON.stringify(created).slice(0,400));
console.log("spreadsheetId:", created.spreadsheetId);
console.log("url:", created.spreadsheetUrl);
