import type { LocaleCode } from "../config/locales.ts";

const zhTW = {
  "nav.home": "首頁", "nav.exchanges": "交易所", "nav.calculator": "交易成本計算器", "nav.rebate": "返傭說明", "nav.faq": "常見問題", "nav.contact": "聯絡我們",
  "settings.title": "設定", "settings.currency": "貨幣", "settings.language": "語言", "settings.open": "開啟貨幣與語言設定", "settings.rateNotice": "估算匯率，非即時報價",
  "footer.tagline": "交易成本優化與手續費返傭平台", "footer.contact": "一般聯絡", "footer.support": "客服支援",
} as const;

type MessageKey = keyof typeof zhTW;
type MessageSet = Record<MessageKey, string>;

export const messages: Record<LocaleCode, MessageSet> = {
  "zh-TW": zhTW,
  "zh-CN": { "nav.home":"首页","nav.exchanges":"交易所","nav.calculator":"交易成本计算器","nav.rebate":"返佣说明","nav.faq":"常见问题","nav.contact":"联系我们","settings.title":"设置","settings.currency":"货币","settings.language":"语言","settings.open":"打开货币与语言设置","settings.rateNotice":"估算汇率，非实时报价","footer.tagline":"交易成本优化与手续费返佣平台","footer.contact":"一般联系","footer.support":"客服支持" },
  en: { "nav.home":"Home","nav.exchanges":"Exchanges","nav.calculator":"Trading Cost Calculator","nav.rebate":"Rebates","nav.faq":"FAQ","nav.contact":"Contact","settings.title":"Settings","settings.currency":"Currency","settings.language":"Language","settings.open":"Open currency and language settings","settings.rateNotice":"Estimated rates, not live quotes","footer.tagline":"Trading cost optimization and fee rebates","footer.contact":"Contact","footer.support":"Support" },
  ja: { "nav.home":"ホーム","nav.exchanges":"取引所","nav.calculator":"取引コスト計算","nav.rebate":"リベート","nav.faq":"よくある質問","nav.contact":"お問い合わせ","settings.title":"設定","settings.currency":"通貨","settings.language":"言語","settings.open":"通貨と言語の設定を開く","settings.rateNotice":"参考レート（リアルタイムではありません）","footer.tagline":"取引コスト最適化と手数料リベート","footer.contact":"お問い合わせ","footer.support":"サポート" },
  ko: { "nav.home":"홈","nav.exchanges":"거래소","nav.calculator":"거래 비용 계산기","nav.rebate":"리베이트","nav.faq":"자주 묻는 질문","nav.contact":"문의","settings.title":"설정","settings.currency":"통화","settings.language":"언어","settings.open":"통화 및 언어 설정 열기","settings.rateNotice":"예상 환율이며 실시간 시세가 아닙니다","footer.tagline":"거래 비용 최적화 및 수수료 리베이트","footer.contact":"일반 문의","footer.support":"고객 지원" },
};

export type { MessageKey };
