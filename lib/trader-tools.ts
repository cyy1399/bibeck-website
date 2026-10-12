export function numeric(text: string): number | null {
  const s = text.replace(/,/g, "").replace(/\s/g, "");
  if (!s || s.length > 100 || !/^[\d.+\-*/()]+$/.test(s)) return null;
  let pos = 0;
  function atom(): number {
    if (s[pos] === "+") { pos++; return atom(); }
    if (s[pos] === "-") { pos++; return -atom(); }
    if (s[pos] === "(") { pos++; const n = sum(); if (s[pos++] !== ")") throw Error(); return n; }
    const m = s.slice(pos).match(/^(?:\d+(?:\.\d*)?|\.\d+)/); if (!m) throw Error(); pos += m[0].length; return Number(m[0]);
  }
  function product(): number { let n = atom(); while (s[pos] === "*" || s[pos] === "/") { const op = s[pos++], rhs = atom(); if (op === "/" && rhs === 0) throw Error(); n = op === "*" ? n * rhs : n / rhs; } return n; }
  function sum(): number { let n = product(); while (s[pos] === "+" || s[pos] === "-") { const op = s[pos++], rhs = product(); n = op === "+" ? n + rhs : n - rhs; } return n; }
  try { const n = sum(); return pos === s.length && Number.isFinite(n) && Math.abs(n) <= 1e12 ? n : null; } catch { return null; }
}
export type PlanInput = { equity: string; risk: string; entry: string; stop: string; target: string; leverage: string; fee: string; slip: string; step: string; direction: "long" | "short" };
export const emptyPlan: PlanInput = { equity: "", risk: "", entry: "", stop: "", target: "", leverage: "", fee: "", slip: "", step: "", direction: "long" };
export const demoPlan: PlanInput = { equity: "10000", risk: "1", entry: "100", stop: "95", target: "110", leverage: "5", fee: "0.05", slip: "0.1", step: "0.001", direction: "long" };
export function calculatePlan(p: PlanInput) {
  const e = numeric(p.equity), risk = numeric(p.risk), entry = numeric(p.entry), stop = numeric(p.stop), target = numeric(p.target), lev = numeric(p.leverage), f = numeric(p.fee), slip = numeric(p.slip), step = numeric(p.step);
  if ([e, risk, entry, stop, target, lev, f, slip, step].some(n => n === null)) return { error: "請填完所有數字；沒有費用或滑價請填 0。支援四則運算與括號。" };
  const [equity, r, a, b, c, l, fee, sl, st] = [e!, risk!, entry!, stop!, target!, lev!, f!, slip!, step!];
  if (equity <= 0 || r <= 0 || r > 100 || a <= 0 || b <= 0 || c <= 0 || l < 1 || l > 125 || fee < 0 || fee > 5 || sl < 0 || sl > 10 || st <= 0 || st > 1e6) return { error: "金額與步進須大於 0；風險為 0–100%（不含 0）、槓桿 1–125、費率 0–5%、滑價 0–10%。" };
  if (p.direction === "long" ? !(b < a && c > a) : !(b > a && c < a)) return { error: "做多須停損低於進場、停利高於進場；做空相反。" };
  const budget = equity * r / 100;
  const perLoss = Math.abs(a - b) + (a + b) * (fee + sl) / 100;
  const qty = Math.floor((budget / perLoss) / st + 1e-10) * st;
  if (!Number.isFinite(qty) || qty <= 0) return { error: "風險預算不足以建立一個數量步進；請核對產品規格。" };
  const loss = qty * perLoss, fees = qty * (a + b) * fee / 100;
  const gain = qty * (Math.abs(c - a) - (a + c) * (fee + sl) / 100);
  const notional = qty * a, margin = notional / l;
  if (![loss, gain, notional, margin, qty].every(Number.isFinite)) return { error: "數值超出計算範圍。" };
  return { qty, budget, loss, fees, gain, notional, margin, rr: gain / loss, warning: margin + qty * a * fee / 100 > equity ? "估計保證金與開倉費超過帳戶權益，不能直接採用此倉位。" : "" };
}
export type Trade = { id: string; date: string; symbol: string; gross: number; fees: number; funding: number; rebate: number; strategy: string };
export const CSV_HEADER = "id,date,symbol,gross_pnl,fees,funding,rebate,strategy";
export const demoCSV = CSV_HEADER + "\nDEMO-01,2026-10-01T08:00:00Z,BTCUSDT,120,8,-2,0,突破\nDEMO-02,2026-10-02T08:00:00Z,ETHUSDT,-65,5,1,0,突破\nDEMO-03,2026-10-03T08:00:00Z,BTCUSDT,40,4,0,0,回調";
export function netTrade(t: Trade) { return t.gross - t.fees + t.funding + t.rebate; }
export function parseJournal(csv: string): Trade[] {
  if (csv.length > 1000000) throw Error("檔案過大，最多 1 MB。");
  const rows: string[][] = []; let row: string[] = [], cell = "", quoted = false;
  const text = csv.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  for (let i = 0; i < text.length; i++) { const c = text[i]; if (c === '"') { if (quoted && text[i+1] === '"') { cell += '"'; i++; } else { if (!quoted && cell) throw Error("CSV 引號格式錯誤。"); quoted = !quoted; } } else if (!quoted && (c === "," || c === "\n")) { row.push(cell); cell = ""; if (c === "\n") { if(row.some(x=>x.trim()))rows.push(row); row = []; } } else cell += c; }
  if (quoted) throw Error("CSV 引號未關閉。"); row.push(cell); if (row.some(x=>x.trim())) rows.push(row);
  if (rows.length < 2 || rows[0].map(s=>s.trim()).join(",") !== CSV_HEADER) throw Error("請使用 BiBeck 標準 CSV 欄位與順序；交易所原始 CSV 尚不支援直接匯入。");
  if (rows.length > 2001) throw Error("最多 2,000 筆交易。");
  const ids = new Set<string>();
  return rows.slice(1).map((r,i) => { if (r.length !== 8) throw Error(`第 ${i+2} 列欄位數不正確。`);
    const [id,date,symbol,g,f,funding,rebate,strategy] = r.map(x=>x.trim());
    const nums=[g,f,funding,rebate].map(x=>/^[-+]?\d+(\.\d+)?$/.test(x)?Number(x):NaN);
    if (!id || id.length>80 || ids.has(id)) throw Error(`第 ${i+2} 列交易 ID 空白或重複。`);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(date) || (!Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,19)!==date.slice(0,19)) || !/^[A-Z0-9]{2,25}USDT$/.test(symbol) || strategy.length>80 || nums.some(n=>!Number.isFinite(n)||Math.abs(n)>1e9) || nums[1]<0 || nums[3]<0) throw Error(`第 ${i+2} 列日期、USDT 合約或金額不正確。費用與已入帳返傭不可為負；不接受空白金額。`);
    ids.add(id); return {id,date,symbol,gross:nums[0],fees:nums[1],funding:nums[2],rebate:nums[3],strategy:strategy||"未分類"};
  }).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date)||a.id.localeCompare(b.id));
}
export function tradeStats(trades: Trade[]) {
  const ordered=[...trades].sort((a,b)=>Date.parse(a.date)-Date.parse(b.date)||a.id.localeCompare(b.id));
  const nets=ordered.map(netTrade); let cumulative=0,peak=0,drawdown=0;
  const curve=nets.map(n=>{cumulative+=n;peak=Math.max(peak,cumulative);drawdown=Math.max(drawdown,peak-cumulative);return cumulative;});
  const wins=nets.filter(n=>n>0), losses=nets.filter(n=>n<0), win=wins.reduce((a,b)=>a+b,0), loss=-losses.reduce((a,b)=>a+b,0);
  return {count:trades.length,net:cumulative,gross:trades.reduce((a,t)=>a+t.gross,0),fees:trades.reduce((a,t)=>a+t.fees,0),funding:trades.reduce((a,t)=>a+t.funding,0),rebate:trades.reduce((a,t)=>a+t.rebate,0),winRate:trades.length?wins.length/trades.length*100:0,expectancy:trades.length?cumulative/trades.length:0,profitFactor:loss?win/loss:null,drawdown,curve};
}
export function money(n: number, digits=2) { return n.toLocaleString("zh-TW",{maximumFractionDigits:digits,minimumFractionDigits:digits}); }
export type SavedPlan = { id: string; createdAt: string; symbol: string; thesis: string; input: PlanInput };
export const PLAN_KEY="bibeck-trader-plans-v1", TRADE_KEY="bibeck-trader-journal-v1";
export function readPlans(raw: string | null): SavedPlan[] {
  if (!raw) return []; const v: unknown=JSON.parse(raw);
  if (!Array.isArray(v)||v.length>100) throw Error("計畫資料格式不正確。");
  return v.map((x:unknown)=>{if(!x||typeof x!=="object")throw Error("計畫資料格式不正確。");const r=x as SavedPlan;if(typeof r.id!=="string"||typeof r.createdAt!=="string"||!Number.isFinite(Date.parse(r.createdAt))||typeof r.symbol!=="string"||typeof r.thesis!=="string"||r.thesis.length>2000||!r.input||!['long','short'].includes(r.input.direction)||Object.keys(emptyPlan).some(k=>typeof r.input[k as keyof PlanInput]!=="string")||'error' in calculatePlan(r.input))throw Error("計畫資料格式不正確。");return r;});
}
export function readTrades(raw: string | null): Trade[] {
  if (!raw) return []; const v:unknown=JSON.parse(raw); if(!Array.isArray(v)||v.length>2000)throw Error("交易資料格式不正確。");
  const csv=CSV_HEADER+"\n"+v.map((x:unknown)=>{if(!x||typeof x!=="object")throw Error("交易資料格式不正確。");const r=x as Trade;return [r.id,r.date,r.symbol,r.gross,r.fees,r.funding,r.rebate,r.strategy].map(y=>'"'+String(y??'').replace(/"/g,'""')+'"').join(',');}).join('\n');
  return v.length?parseJournal(csv):[];
}
