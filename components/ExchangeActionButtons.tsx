import Link from "next/link";
import { ExternalLink } from "@/components/ExternalLink";
import { exchangeActionConfig, getExchangeActionLabels } from "@/config/actions";
import type { ExchangeSlug } from "@/config/exchanges";

export function ExchangeActionButtons({ exchangeSlug, calculatorHref }: { exchangeSlug: ExchangeSlug; calculatorHref: string }) {
  const exchange = exchangeActionConfig[exchangeSlug];
  const labels = getExchangeActionLabels(exchange);

  return (
    <div>
      <div className="grid gap-3 sm:flex sm:flex-wrap">
        {exchange.registrationUrl ? (
          <ExternalLink href={exchange.registrationUrl} sponsored className="w-full sm:w-auto">{labels.rebateSignup}</ExternalLink>
        ) : (
          <button type="button" disabled title="此交易所的 BiBeck 返傭服務尚未開放" className="button-primary w-full cursor-not-allowed opacity-40 sm:w-auto">{labels.rebateSignup}</button>
        )}
        {exchange.rebateDashboardUrl ? (
          <ExternalLink href={exchange.rebateDashboardUrl} variant="secondary" className="w-full sm:w-auto">{labels.rebateDashboard}</ExternalLink>
        ) : (
          <button type="button" disabled title="此交易所的 BiBeck 返傭服務尚未開放" className="button-secondary w-full cursor-not-allowed opacity-40 sm:w-auto">{labels.rebateDashboard}</button>
        )}
        <Link href={calculatorHref} className="button-secondary w-full sm:w-auto">{labels.costCalculator}</Link>
      </div>
      {!exchange.rebateSupported ? <p className="mt-3 text-xs leading-6 text-white/42">此交易所的 BiBeck 返傭服務尚未開放；完整計算功能即將開放。</p> : null}
    </div>
  );
}
