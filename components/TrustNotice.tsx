export function TrustNotice({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`trust-notice ${compact ? "p-6" : "p-7 sm:p-8"}`} aria-label="BiBeck 第三方與風險聲明">
      <p className="eyebrow">第三方與風險聲明</p>
      <p className="mt-4 text-base font-medium leading-7 text-white">
        BiBeck 為獨立第三方平台，並非由 Bybit 擁有、營運或官方背書。
      </p>
      <p className="mt-3 text-sm leading-7 text-secondary">
        BiBeck 亦非 Bybit 員工或代表，不保管用戶資產、不代替使用者交易，且不保證投資獲利。返傭資格、比例與發放條件可能依合作方規則調整，實際交易費率請以 Bybit 帳戶顯示為準。
      </p>
    </aside>
  );
}
