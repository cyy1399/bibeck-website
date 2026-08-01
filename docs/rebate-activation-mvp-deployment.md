# Bybit 返傭開通 MVP 部署手冊

正式啟用前，`REBATE_ACTIVATION_ENABLED` 必須保持 `false`。本功能不會自動登入、爬取或操作 Bybit 或第三方返傭後台。

## 1. PostgreSQL 與 DATABASE_URL

在正式 Vercel Project 連接受管理 PostgreSQL（建議透過 Vercel Marketplace 的 Neon），取得 pooled TLS `DATABASE_URL`。不要將連線密碼提交至 Git。

## 2. Migration

先備份正式資料庫，再於具有 Production `DATABASE_URL` 的受控環境執行：

```bash
pnpm db:migrate
```

確認已套用 `0000_chemical_banshee.sql` 與 `0001_bybit_activation_mvp.sql`，並確認 `exchange + normalized_uid` 唯一索引存在。

## 3. Google OAuth 與 Auth.js

在 Google Cloud Console 建立 Web OAuth Client：

- Origin：`https://bibeck.com`
- Redirect URI：`https://bibeck.com/api/auth/callback/google`
- Vercel：設定 `AUTH_SECRET`、`AUTH_GOOGLE_ID`、`AUTH_GOOGLE_SECRET`
- Allowlist：`ADMIN_EMAIL_ALLOWLIST=hello@bibeck.com`

`admin@bibeck.com` 是 Email alias，不可用來登入 Google OAuth。

## 4. Email Provider 與寄件網域

設定 `EMAIL_PROVIDER_API_KEY`、`EMAIL_FROM=BiBeck <hello@bibeck.com>`、`REBATE_ADMIN_EMAIL=admin@bibeck.com`、`SUPPORT_EMAIL=support@bibeck.com`。在 Provider 完成 `bibeck.com` 的 SPF、DKIM 與必要驗證，測試收件與完成通知。

## 5. Turnstile

在 Cloudflare 建立只允許 `bibeck.com` 的 widget，設定 `NEXT_PUBLIC_TURNSTILE_SITE_KEY` 與 server-only `TURNSTILE_SECRET_KEY`。Production 缺少任一必要設定時，表單會 fail closed。

## 6. Vercel 環境變數

依 `.env.example` 設定 Production 與 Preview。正式 URL 使用：

- `APP_URL=https://bibeck.com`
- `BYBIT_REBATE_SIGNUP_URL=https://partner.bybit.com/b/t00000016`
- `BYBIT_REBATE_BACKOFFICE_URL=https://bybackoffice.com/user-login`

## 7. Preview 測試

使用測試資料確認三欄驗證、Turnstile、重複 UID、收件 Email、Google allowlist、狀態更新、確認 Modal、完成 Email、失敗重送與 audit event。不得用真實客戶 UID。

## 8. Production smoke test

1. 建立測試案件，確認資料庫固定 `rebate_rate=20`。
2. 確認未授權與非 allowlist 帳號無法進入 `/admin/rebate-requests`。
3. 在外部後台完成測試 UID 設定後，再勾選確認並完成案件。
4. 確認完成時間、完成者、audit event 與 Email 時間戳。
5. 模擬 Email 失敗，確認案件仍為 COMPLETED 且可單獨重送。
6. 檢查 375px、390px、1440px、console、hydration、robots 與 sitemap。

## 9. 開啟功能

以上全部完成後，才將 `REBATE_ACTIVATION_ENABLED=true`。每次修改環境變數後重新部署並再次 smoke test。

## 10. Rollback

先將 `REBATE_ACTIVATION_ENABLED=false` 並重新部署，保留案件與 audit log。不要回滾外部已完成的人工設定。若需資料庫回復，使用正式備份及經審核的 forward migration。

## 需要 BiBeck 營運者確認

- UID、Email、案件與 audit log 的保存、刪除及更正期限。
- 第三方返傭後台的正式營運規則、顯示同步與追溯規則。
- Email 重送、補件與爭議處理的內部作業流程。
