import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Money OS｜把真實財務變成可理解、可升級的系統",
  description: "BiBeck Money OS 將日常財務紀錄轉成分析、等級、階段與下一步任務。等級反映現在的真實財務狀態，可即時升降，不以月底或使用天數決定。",
  path: "/money-os",
});

const stages = [
  { level: "LV.1–19", name: "重建期", meaning: "先解除立即財務風險，停止失血。" },
  { level: "LV.20–39", name: "基礎期", meaning: "建立正現金流與第一層安全網。" },
  { level: "LV.40–59", name: "穩定期", meaning: "讓財務可以承受一般生活衝擊。" },
  { level: "LV.60–74", name: "累積期", meaning: "穩定把現金流轉成可持續累積的資產。" },
  { level: "LV.75–89", name: "成長期", meaning: "提高收入、資產與風險配置的效率。" },
  { level: "LV.90–100", name: "自由期", meaning: "工作逐漸不再是維持生活的必要條件。" },
] as const;

const attributes = [
  ["現金流力", "每個月能不能真正留下錢。"],
  ["安全力", "收入中斷後，可用資金能支撐多久。"],
  ["負債控制", "負債是在可控範圍內，還是在侵蝕財務。"],
  ["收入韌性", "收入能否穩定覆蓋生活，並承受波動。"],
  ["成長力", "財務系統是否持續創造新的淨資產。"],
  ["自由度", "對下一份工作收入的依賴程度有多高。"],
] as const;

const recordTypes = [
  ["支出", "真正消耗掉的錢，例如餐飲、房租、交通。"],
  ["收入", "薪資、事業、佣金、投資等實際入帳。"],
  ["轉帳", "資產位置改變，不把同一筆錢重複算成收入或支出。"],
  ["投資", "現金轉成投資資產，交易成本與資產價值分開記錄。"],
  ["還款", "本金與利息分開理解，避免把所有還款都當成消費。"],
] as const;

export default function MoneyOsPage() {
  return (
    <SiteShell>
      <section className="home-hero relative px-5 pb-16 pt-32 sm:px-8 sm:pb-20 sm:pt-36 lg:pb-24 lg:pt-36">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div className="relative z-10">
            <p className="eyebrow">BiBeck Money OS</p>
            <h1 className="mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[1.05] text-white sm:text-7xl">
              把你的真實生活，<br />變成一套會持續升級的財務系統。
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-9 text-secondary">
              記錄每一筆錢，理解現在的財務狀態，找到最重要的下一步；當真實財務變強，等級就升。變弱，也會降。
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/48">
              Money OS 正在建置中。這一頁公開產品的核心規則與設計方向，不代表目前已提供完整帳號、記帳與持續儲存功能。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#core" className="cta-button button-primary">查看核心機制</a>
              <Link href="/tools" className="cta-button button-secondary">使用現有工具</Link>
            </div>
          </div>

          <div className="relative z-10 border border-white/12 bg-[#0d0d0d]/92 p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-6">
              <div>
                <p className="text-xs tracking-[0.16em] text-white/42">財務評級示意</p>
                <p className="mt-3 text-5xl font-semibold text-white">LV.27</p>
                <p className="mt-2 text-sm text-gold">基礎期</p>
              </div>
              <div className="text-right text-xs leading-6 text-white/42">
                <p>起始 LV.24</p>
                <p>歷史最高 LV.31</p>
              </div>
            </div>

            <div className="py-6">
              <p className="text-xs tracking-[0.14em] text-gold">主線任務</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">建立第一個月安全預備金</h2>
              <div className="mt-5 h-2 overflow-hidden bg-white/8">
                <div className="h-full w-[60%] bg-gold transition-all duration-700" />
              </div>
              <div className="mt-3 flex justify-between gap-4 text-sm text-white/56">
                <span>NT$18,000 / NT$30,000</span>
                <span>60%</span>
              </div>
            </div>

            <div className="grid gap-px bg-white/10 sm:grid-cols-3">
              {[["現金流力", "72"], ["安全力", "31"], ["負債控制", "48"]].map(([label, value]) => (
                <div key={label} className="bg-[#0d0d0d] p-4">
                  <p className="text-xs text-white/42">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-6 text-white/34">以上數值僅為介面概念示意，正式評級必須由真實財務資料計算。</p>
          </div>
        </div>
      </section>

      <section id="core" className="section-muted border-y border-white/10 px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">核心循環</p>
          <h2 className="mt-5 max-w-4xl text-balance text-3xl font-semibold leading-tight text-white sm:text-5xl">記錄 → 理解 → 行動 → 升級。</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-secondary">Money OS 不以「使用網站多久」衡量成長，而是把真實生活中的財務變化轉成可理解的狀態與下一步。</p>
          <div className="mt-10 grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "財務紀錄", "發生了什麼：收入、支出、轉帳、投資、還款。"],
              ["02", "財務分析", "現在怎麼樣：現金流、資產、負債、趨勢與風險。"],
              ["03", "財務評級", "現在多強：LV、財務階段與六大能力。"],
              ["04", "任務系統", "接下來做什麼：一個主線任務與少量支線任務。"],
            ].map(([index, title, copy]) => (
              <article key={title} className="bg-[#0a0a0a] p-6">
                <p className="font-mono text-xs text-gold">{index}</p>
                <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/56">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">等級規則</p>
            <h2 className="mt-5 text-balance text-3xl font-semibold text-white sm:text-4xl">新玩家不是從 LV.1 開始。</h2>
            <p className="mt-5 text-base leading-8 text-secondary">第一次進入時是「尚未評級」。完成最小財務掃描後，系統直接依當下真實財務狀態建立起始等級。</p>
          </div>
          <div className="grid gap-4">
            {[
              ["尚未評級 → 起始等級", "加入 BiBeck 的時間不代表財務實力。第一次正式評級就是你的起始 LV。"],
              ["可以升，也可以降", "LV 代表現在的財務實力。重大負債、收入中斷或資產損失，都可能讓等級下降。"],
              ["沒有月底升級", "每一次有效財務事件都可以重新計算狀態；跨過實質門檻時，就即時升級或降級。"],
              ["V1 不用 XP", "不靠登入、點擊或完成假任務累積經驗值。真實財務改善本身就是升級依據。"],
              ["歷史不消失", "保留起始等級、目前等級與歷史最高等級，讓使用者看見自己的真實成長路徑。"],
            ].map(([title, copy]) => (
              <div key={title} className="border border-white/10 bg-[#101010] p-6">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/56">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-muted border-y border-white/10 px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">財務階段</p>
          <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">先判斷你在哪個世界，再決定你走了多遠。</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-secondary">財務階段由現實條件解鎖，不用平均分硬湊。重大風險會限制能進入的等級區間。</p>
          <div className="mt-10 grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            {stages.map((stage) => (
              <article key={stage.name} className="bg-[#0d0d0d] p-6">
                <p className="font-mono text-xs text-gold">{stage.level}</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{stage.name}</h3>
                <p className="mt-3 text-sm leading-7 text-white/56">{stage.meaning}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">六大財務能力</p>
          <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">等級背後必須是可解釋的真實狀態。</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {attributes.map(([title, copy], index) => (
              <article key={title} className="border border-white/10 bg-[#101010] p-6">
                <div className="flex items-end justify-between gap-4">
                  <h3 className="text-xl font-semibold text-white">{title}</h3>
                  <span className="font-mono text-xs text-white/28">0–100</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/56">{copy}</p>
                <div className="mt-5 h-1.5 overflow-hidden bg-white/8">
                  <div className="h-full bg-gold" style={{ width: `${36 + index * 9}%` }} />
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-xs leading-6 text-white/38">六項能力不會永遠等權。不同財務階段關心的核心風險不同；例如重建期更重視現金流、安全力與負債控制，自由期才會提高自由度的重要性。</p>
        </div>
      </section>

      <section className="section-muted border-y border-white/10 px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="eyebrow">財務紀錄</p>
            <h2 className="mt-5 text-balance text-3xl font-semibold text-white sm:text-4xl">每天最重要的操作，只是「記一筆」。</h2>
            <p className="mt-5 text-base leading-8 text-secondary">前台要像簡單的記帳工具，後台則保留正確的財務語意。使用者不需要學會計，系統不能因此把同一筆錢算錯兩次。</p>
          </div>
          <div className="grid gap-3">
            {recordTypes.map(([title, copy]) => (
              <div key={title} className="grid gap-2 border-b border-white/10 py-4 sm:grid-cols-[7rem_1fr]">
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm leading-7 text-white/56">{copy}</p>
              </div>
            ))}
            <div className="mt-3 border border-gold/25 bg-[#15130d] p-5 text-sm leading-7 text-white/62">
              信用卡消費在消費當下記成支出；之後繳卡費只是資產與負債同時下降，不能再算第二次支出。銀行間轉帳也不應被算成新的收入與支出。
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">任務系統</p>
          <h2 className="mt-5 max-w-4xl text-balance text-3xl font-semibold text-white sm:text-4xl">首頁永遠只回答：現在最該做什麼？</h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <article className="border border-gold/35 bg-[#15130d] p-7">
              <p className="text-xs tracking-[0.14em] text-gold">主線任務</p>
              <h3 className="mt-4 text-2xl font-semibold text-white">同一時間只保留一個最高優先任務。</h3>
              <p className="mt-4 text-sm leading-7 text-white/58">先處理危機，再處理現金流、高風險負債、安全預備金、資產累積與自由度。任務必須能說明「為什麼是現在」以及「完成後會改變什麼」。</p>
            </article>
            <article className="border border-white/10 bg-[#101010] p-7">
              <p className="text-xs tracking-[0.14em] text-white/42">支線任務</p>
              <h3 className="mt-4 text-2xl font-semibold text-white">少量、可執行，不和主線搶注意力。</h3>
              <p className="mt-4 text-sm leading-7 text-white/58">例如補上貸款年利率、取消不需要的訂閱、確認一筆近期義務。可以幫主線前進，也可以提升分析完整度。</p>
            </article>
          </div>
          <div className="mt-6 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["1", "危機", "逾期、違約、必要支出缺口。"],
              ["2", "穩定", "讓現金流轉正、處理高風險負債、建立安全網。"],
              ["3", "累積", "把穩定現金流持續轉成資產。"],
              ["4", "自由", "降低對工作收入的依賴。"],
            ].map(([order, title, copy]) => (
              <div key={title} className="bg-[#0a0a0a] p-5">
                <span className="font-mono text-xs text-gold">{order}</span>
                <h3 className="mt-3 font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/50">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-muted border-y border-white/10 px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">時間邏輯</p>
            <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">沒有「月底才算數」。</h2>
            <p className="mt-5 text-base leading-8 text-secondary">月份只是分析資料的時間區間，不是升級週期。財務狀態真的跨過門檻，就應該當下反映。</p>
            <div className="mt-7 space-y-4 text-sm leading-7 text-white/58">
              <p><strong className="text-white">即時狀態：</strong>帳戶餘額、負債、安全資金、近期義務。</p>
              <p><strong className="text-white">滾動資料：</strong>近 30 天支出、近 90 天收入、近 6 個月波動等持續更新。</p>
              <p><strong className="text-white">歷史分析：</strong>7 天、30 天、3 個月、1 年或自訂區間，只負責看過去發生了什麼。</p>
            </div>
          </div>
          <div>
            <p className="eyebrow">避免等級抖動</p>
            <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">每筆資料都更新，但不是每杯咖啡都掉級。</h2>
            <p className="mt-5 text-base leading-8 text-secondary">小幅日常波動不應讓 LV 反覆跳動。系統需要穩定區間；只有跨過實質門檻或出現重大財務事件，才改變正式等級與階段。</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">第一次使用</p>
          <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">先用最少資料給出第一個有用答案。</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-secondary">初始掃描不應該是十頁問卷。只取得足以判斷目前風險與第一個主線任務的資訊，其餘資料在真正需要時再補。</p>
          <div className="mt-10 grid gap-px bg-white/10 md:grid-cols-4">
            {[
              ["01", "可用資金", "現金與銀行存款，投資資產可選填。"],
              ["02", "基本現金流", "每月實拿收入與必要生活支出。"],
              ["03", "負債", "總額、最低還款與是否逾期。"],
              ["04", "近期義務", "未來 30 天是否有必要的大筆付款。"],
            ].map(([index, title, copy]) => (
              <article key={title} className="bg-[#0a0a0a] p-6">
                <p className="font-mono text-xs text-gold">{index}</p>
                <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/54">{copy}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 border border-white/10 bg-[#101010] p-6">
            <p className="text-sm leading-7 text-white/58"><strong className="text-white">不知道不是 0。</strong> 資料不足時顯示「尚未確認」、資料完整度與判斷信心；不能為了給答案而製造假精準。</p>
          </div>
        </div>
      </section>

      <section className="section-muted border-y border-white/10 px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">產品原則</p>
            <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">第一性原理、簡單、效率。</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["繁體中文優先", "除 Money OS、LV、Bybit、APR 等必要專有名詞外，介面與說明以繁體中文為主。"],
              ["科技感來自反應", "數字更新、進度變化、階段突破與任務完成才需要動效，不用裝飾性的炫技。"],
              ["真實資料優先", "使用時間不代表成長；財務真的改善，角色才變強。"],
              ["漸進式補資料", "先給有用答案，需要更準時再問下一個問題。"],
              ["不鼓勵冒險", "交易量、槓桿與交易次數不應成為升級條件。"],
              ["可解釋", "每個等級、能力與任務，都要能回答為什麼。"],
            ].map(([title, copy]) => (
              <article key={title} className="border border-white/10 bg-[#0d0d0d] p-6">
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/54">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">BiBeck Money OS</p>
          <h2 className="mt-6 text-balance text-3xl font-semibold text-white sm:text-5xl">每天記一筆，系統幫你看懂；真實人生變強，等級就會改變。</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-secondary">這是 Money OS V1 的產品方向。下一步會把這套規則逐步變成可輸入、可記錄、可分析、可持續使用的真實產品。</p>
        </div>
      </section>
    </SiteShell>
  );
}
