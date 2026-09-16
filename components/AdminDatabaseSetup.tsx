export function AdminDatabaseSetup() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-5 py-16 text-white">
      <section className="mx-auto max-w-2xl border border-amber-400/30 bg-[#121212] p-8">
        <p className="eyebrow">BiBeck Operations</p>
        <h1 className="mt-3 text-3xl font-semibold">資料庫尚未連接</h1>
        <p className="mt-5 leading-7 text-secondary">
          Google 管理員登入已完成，但案件清單需要 PostgreSQL 才能使用。請先在 Vercel Marketplace
          連接 Neon，確認 Production 已有 DATABASE_URL，套用 migration 後再重新部署。
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm leading-6 text-secondary">
          <li>Vercel Project → Storage 或 Marketplace → Neon Postgres。</li>
          <li>連接到此 Production 專案，確認已自動新增 DATABASE_URL。</li>
          <li>在受控環境執行 pnpm db:migrate，再重新部署 Production。</li>
        </ol>
      </section>
    </main>
  );
}
