export function TrustNotice({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={"trust-notice " + (compact ? "p-6" : "p-7 sm:p-8")} aria-label="BiBeck 第三方、合作夥伴與風險聲明">
      <p className="eyebrow">第三方與風險聲明</p>
      <p className="mt-4 text-base font-medium leading-7 text-white">
        BiBeck 為獨立第三方交易成本與返傭資訊平台，並非由任何交易所擁有、營運或官方背書。
      </p>
      <p className="mt-3 text-sm leading-7 text-secondary">
        BiBeck 不提供投資建議、不保證任何獲利，也不保管使用者資產。交易涉及風險，使用者應自行評估並閱讀相關交易所條款。
      </p>
      <p className="mt-3 text-sm leading-7 text-secondary">
        部分連結可能為合作夥伴連結；這項合作關係不會提高使用者原本適用的交易所手續費。
      </p>
    </aside>
  );
}
