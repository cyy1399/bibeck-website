import Link from "next/link";
import { ExternalLink } from "@/components/ExternalLink";
import { exchangeActionConfig, getExchangeActionLabels } from "@/config/actions";
import type { ExchangeSlug } from "@/config/exchanges";
import { rebateActivationReadiness } from "@/config/rebate-activation";

export function ExchangeActionButtons({ exchangeSlug, calculatorHref }: { exchangeSlug: ExchangeSlug; calculatorHref: string }) {
  const exchange = exchangeActionConfig[exchangeSlug];
  const labels = getExchangeActionLabels(exchange);
  const activation = rebateActivationReadiness();

  return (
    <div>
      <div className="grid gap-3 sm:flex sm:flex-wrap">
        {exchange.registrationUrl ? (
          <ExternalLink href={exchange.registrationUrl} sponsored className="w-full sm:w-auto">{labels.rebateSignup}</ExternalLink>
        ) : (
          <button type="button" disabled title="此交易所的 BiBeck 返傭服務尚未開放" className="cta-button button-primary w-full cursor-not-allowed opacity-40 sm:w-auto">{labels.rebateSignup}</button>
        )}
        {exchangeSlug === "bybit" ? activation.enabled ? <Link href="/rebate/activate" className="cta-button button-secondary w-full sm:w-auto">已完成註冊，繼續開通返傭</Link> : <span className="cta-button button-secondary w-full cursor-not-allowed opacity-50 sm:w-auto" title="返傭開通功能準備中">功能準備中</span> : null}
        {exchange.rebateDashboardUrl ? (
          <ExternalLink href={exchange.rebateDashboardUrl} sponsored={false} variant="secondary" className="w-full sm:w-auto">{labels.rebateDashboard}</ExternalLink>
        ) : (
          <button type="button" disabled title="此交易所的 BiBeck 返傭服務尚未開放" className="cta-button button-secondary w-full cursor-not-allowed opacity-40 sm:w-auto">{labels.rebateDashboard}</button>
        )}
        {exchangeSlug !== "bybit" ? <Link href={calculatorHref} className="cta-button button-secondary w-full sm:w-auto">{labels.costCalculator}</Link> : null}
      </div>
      {exchangeSlug === "bybit" ? <p className="mt-3 text-xs leading-6 text-white/48">完成註冊後，必須返回 BiBeck 提交 UID，才能進入人工設定流程。在收到完成通知前，請勿自行假設返傭已生效。</p> : null}
      {!exchange.rebateSupported ? <p className="mt-3 text-xs leading-6 text-white/42">此交易所的 BiBeck 返傭服務尚未開放；完整計算功能即將開放。</p> : null}
    </div>
  );
}
