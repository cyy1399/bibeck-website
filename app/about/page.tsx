import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { createPageMetadata } from "@/config/seo";
export const metadata = createPageMetadata({ title: "關於 Beck", description: "BiBeck 是 Beck 持續學習、整理與實踐的地方。", path: "/about" });
export default function AboutPage() {
  return <SiteShell><section className="px-5 pb-24 pt-36 sm:px-8 sm:pt-44"><div className="mx-auto max-w-3xl"><p className="eyebrow">關於 Beck</p><h1 className="mt-6 text-4xl font-semibold leading-[1.4] text-white sm:text-5xl">把學到的東西，<br />整理成能用的東西。</h1><div className="mt-10 space-y-6 text-base leading-9 text-secondary"><p>我是 Beck。我從自己手上的資源開始，持續學習金錢、投資與事業，嘗試理解：如何在金錢的規則裡站穩腳跟，讓生活多一些選擇。</p><p>BiBeck 是這段過程的整理。理財筆記從收入、支出、負債與預備金開始；投資筆記則拆解商品、風險、成本與判斷方法。</p><p>我沒有所有答案。資料、假設與結論會分開說明；理解改變時，內容也會修正。希望你讀完以後，能知道自己下一步要確認什麼、做什麼。</p></div><div className="mt-12 flex flex-wrap gap-6 border-t border-white/12 pt-8"><Link href="/money" className="focus-ring text-gold">閱讀理財筆記 ↗</Link><Link href="/investing" className="focus-ring text-gold">閱讀投資筆記 ↗</Link><Link href="/contact" className="focus-ring text-gold">聯絡我 ↗</Link></div></div></section></SiteShell>;
}
