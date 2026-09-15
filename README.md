# BiBeck Website

BiBeck 官方網站專案，提供跨交易所交易成本資訊、VIP 與返傭級距說明，以及 Bybit 交易成本計算與高交易量快速審核功能。

## 本機開發

需求：Node.js `>=22.13.0`

```bash
npm install
npm run dev
```

## 驗證

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Rebate Application Operations

### 申請資料儲存位置

所有一般 Bybit 返傭申請均由伺服器端 `/api/rebate-applications` 寫入 PostgreSQL 的 `rebate_activation_cases` 資料表；每次狀態異動及通知紀錄會寫入 `rebate_case_events`。只有資料庫交易完成後，前台才會顯示送出成功。

管理員以 `ADMIN_EMAIL_ALLOWLIST` 內的 Google 帳號登入後，可在 `/admin/rebate-requests` 查看申請清單、交易量、狀態及通知錯誤，並在案件頁更新狀態與內部審核備註。正式環境也可使用 PostgreSQL 管理介面查詢相同資料表。

案件狀態依序為：`SUBMITTED`（已送出）、`REVIEWING`（審核中）、`APPROVED`（審核通過）、`ACTIVATED`（已開通）及 `REJECTED`（未通過）。審核與開通仍由人工決定，不會依交易量自動核准。

### Email 通知

- 申請人：提交成功後收到收件確認；狀態改為 `APPROVED`、`ACTIVATED` 或 `REJECTED` 時收到正式通知。
- 內部：每筆新申請寄送至 `REBATE_APPLICATION_NOTIFICATION_EMAIL`；未設定時依序使用 `REBATE_ADMIN_EMAIL`、`SUPPORT_EMAIL`。
- Email 發送失敗不會刪除資料庫案件；管理員可在案件頁查看通知失敗並重送開通通知。

### 必要環境變數

```env
DATABASE_URL=
EMAIL_PROVIDER_API_KEY=
EMAIL_FROM=BiBeck <hello@bibeck.com>
REBATE_APPLICATION_NOTIFICATION_EMAIL=support@bibeck.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
ADMIN_EMAIL_ALLOWLIST=hello@bibeck.com
NEXT_PUBLIC_LINE_OFFICIAL_URL=https://lin.ee/6y7TnUP
NEXT_PUBLIC_BYBIT_REFERRAL_URL=https://partner.bybit.com/b/t00000016
```

所有密鑰僅能使用伺服器端環境變數，不得加上 `NEXT_PUBLIC_`。部署前執行 `pnpm db:migrate` 套用 Drizzle migration。

### 法務版本與失敗復原

同意版本與隱私權版本集中在 `config/rebate-activation.ts` 的 `REBATE_CONSENT_VERSION`、`REBATE_PRIVACY_VERSION`；更新法律內容時應同步修改兩者與頁面日期。LINE 網址集中於 `NEXT_PUBLIC_LINE_OFFICIAL_URL`。

若提交失敗，前台不會顯示成功。先檢查 Vercel runtime log、資料庫連線及 migration，再確認 `rebate_activation_cases` 是否已有紀錄；Email 失敗時案件仍保留，可依 `notification_status` 與 `notification_error` 處理，不要要求申請人重複提交敏感資料。

## 高交易量申請寄信設定

複製 `.env.example` 並設定伺服器端環境變數：

```env
APPLICATION_EMAIL_TO=support@bibeck.com
APPLICATION_EMAIL_FROM=BiBeck Application <hello@bibeck.com>
EMAIL_PROVIDER_API_KEY=
```

`EMAIL_PROVIDER_API_KEY` 使用 Resend API Key。請勿使用 `NEXT_PUBLIC_` 前綴或將密鑰提交到版本庫。
