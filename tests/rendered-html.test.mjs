import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname="/") { const workerUrl=new URL("../dist/server/index.js",import.meta.url); workerUrl.searchParams.set("test",process.pid+Date.now()+pathname); const {default:worker}=await import(workerUrl.href); return worker.fetch(new Request("http://localhost"+pathname,{headers:{accept:"text/html"}}),{ASSETS:{fetch:async()=>new Response("Not found",{status:404})}},{waitUntil(){},passThroughOnException(){}}); }

test("首頁以計算器為主要行動且後台入口獨立",async()=>{const html=await (await render()).text(); assert.match(html,/降低每一筆交易成本/); assert.match(html,/開始計算交易成本/); assert.match(html,/了解 BiBeck 返傭/); assert.match(html,/登入 Bybit 返傭後台/); assert.doesNotMatch(html,/已完成註冊，繼續開通返傭|申請提高返傭比例/);});
test("Bybit 頁使用公開級距與統一申請入口",async()=>{const html=await (await render("/platform/bybit")).text(); for(const text of ["標準交易者","活躍交易者","菁英交易者","核心交易者","特殊合作方案","未滿 10M USDT","200M USDT 以上","取得 Bybit 返傭帳號","登入 Bybit 返傭後台"]) assert.match(html,new RegExp(text)); assert.doesNotMatch(html,/40%|人工|high-volume-application|rebate\/activate/);});
test("FAQ schema 與實際九項核心問題一致",async()=>{const html=await (await render("/faq")).text(); assert.match(html,/FAQPage/); assert.match(html,/BiBeck 是 Bybit 官方平台嗎/); assert.match(html,/達到交易量後會自動升級嗎/); assert.doesNotMatch(html,/人工審核|保證核准/);});
test("舊高交易量與啟用頁會重新導向",async()=>{for(const path of ["/high-volume-application","/rebate/activate"]){const response=await render(path); assert.ok([301,307,308].includes(response.status)); assert.match(response.headers.get("location")??"",/\/rebate$/);}});
test("水平三方案比較與 CTA 無障礙設定存在",async()=>{const [source,styles]=await Promise.all([readFile(new URL("../components/BybitCostCalculator.tsx",import.meta.url),"utf8"),readFile(new URL("../app/globals.css",import.meta.url),"utf8")]); assert.match(source,/aria-label="交易成本方案比較"/); assert.match(source,/推薦/); assert.match(styles,/grid-auto-flow:\s*column/); assert.match(styles,/scroll-snap-type:\s*x mandatory/); assert.match(styles,/grid-auto-columns:\s*minmax\(250px, 82vw\)/);});
test("申請與後台 URL 由環境變數集中管理",async()=>{const links=await readFile(new URL("../config/links.ts",import.meta.url),"utf8"); assert.match(links,/NEXT_PUBLIC_BIBECK_REBATE_APPLICATION_URL/); assert.match(links,/NEXT_PUBLIC_REBATE_BACKOFFICE_URL/);});
