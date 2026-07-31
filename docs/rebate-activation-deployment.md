# 返傭啟用流程部署手冊

程式碼完成不代表正式功能已啟用。所有外部資源完成後，才將 `REBATE_ACTIVATION_ENABLED` 設為 `true`。

## 1. PostgreSQL 與 migration

1. 在唯一的正式 Vercel Project 透過 Marketplace 建立 Neon PostgreSQL，或連接既有受管理 PostgreSQL。
2. 將 pooled、TLS-enabled 連線字串設為 `DATABASE_URL`。不要提交真實密碼。
3. 在受控環境執行 `pnpm db:migrate`，確認套用 `drizzle/0000_chemical_banshee.sql`。
4. 檢查三張資料表、enum、外鍵與 `exchange + normalized_uid` active partial unique index。

## 2. Vercel 環境變數

依 `.env.example` 設定 Production 及必要的 Preview 環境。`APP_URL` 正式值為 `https://bibeck.com`。完成後重新部署，不要在 Build Log 列印 secrets。

## 3. Google OAuth / Auth.js

1. 在 Google Cloud Console 建立 Web OAuth Client。
2. Authorized JavaScript origin 設為 `https://bibeck.com`。
3. Authorized redirect URI 設為 `https://bibeck.com/api/auth/callback/google`；Preview 如需測試，另加精確 Preview callback。
4. 將 Client ID／Secret 設為 `AUTH_GOOGLE_ID`／`AUTH_GOOGLE_SECRET`，另產生高熵 `AUTH_SECRET`。
5. `ADMIN_EMAIL_ALLOWLIST=hello@bibeck.com`。`admin@bibeck.com` 是別名，不能作為 Google OAuth 登入帳號。
6. 測試 allowlist 帳號可登入、其他 Google 帳號被拒絕，並確認管理頁和 API 都在 server side 驗證。

## 4. Email provider

設定 `EMAIL_PROVIDER_API_KEY`、`EMAIL_FROM=BiBeck <hello@bibeck.com>`、`REBATE_ADMIN_EMAIL=admin@bibeck.com`、`SUPPORT_EMAIL=support@bibeck.com`。確認寄件網域 SPF、DKIM、DMARC 與 From 地址已在現有 provider 驗證。寄信失敗不會回滾案件，但管理頁會顯示待重送。

## 5. Turnstile

1. 在 Cloudflare Turnstile 建立 `bibeck.com` widget。
2. 設定 `NEXT_PUBLIC_TURNSTILE_SITE_KEY` 與 server-only `TURNSTILE_SECRET_KEY`。
3. 驗證缺少或錯誤 token 會被拒絕。Production 不會因缺少 secret 而自動略過。

## 6. Bybit 外部後台

如營運者已確認實際 URL，再設定 `BYBIT_BACKOFFICE_URL`。未設定時按鈕會隱藏，不影響案件處理。BiBeck 不會自動登入、爬取或操作該網站，也不宣稱其官方性已驗證。

## 7. 功能開關

資料庫 migration、Email、OAuth allowlist、Turnstile 與管理員 smoke test 全部完成後，才設定 `REBATE_ACTIVATION_ENABLED=true`。缺少必要變數時 Production 仍會 fail closed，CTA 顯示「功能準備中」。

## 8. Production smoke test

- 使用測試 UID 建立案件，確認 DB 僅保存 tracking token hash。
- 確認申請者與管理員收到 Email；案件狀態 URL 顯示遮蔽 UID／Email 且 noindex。
- 確認重複 UID 不建立第二筆案件，也不向不同 Email 洩露案件資料。
- 使用 `hello@bibeck.com` 登入，搜尋案件並依序切換 UID_PENDING、PENDING_MANUAL_SETUP。
- 未勾選外部後台完成或未填比例／時間時，COMPLETED 必須被拒絕。
- 完成後確認 audit log、完成 Email、實際比例與狀態頁。
- 驗證 375px、390px、1440px 與 console／hydration 狀態。

## 9. Rollback

1. 立即將 `REBATE_ACTIVATION_ENABLED=false` 並重新部署；公開 CTA 會進入準備中狀態。
2. 不刪除案件或 audit log。先保存錯誤時間、遮蔽後案件編號與 Vercel request ID。
3. 如為 Email 問題，修復後從管理頁重送；如為 schema 問題，使用經審核的新 migration，不直接修改 Production 資料表。
4. 確認問題排除並完成 smoke test 後再開啟功能。

## 需要 BiBeck 營運者確認

- 返傭啟用案件、UID、Email 與 audit log 的正式保存期限及刪除／更正流程。
- `BYBIT_BACKOFFICE_URL` 的實際網域、營運者與 Bybit 授權範圍。
- Bybit 實際生效、同步與過往手續費追溯規則；網站與 Email 均不得自行承諾。
