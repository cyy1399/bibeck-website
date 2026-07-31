# BiBeck 正式環境檢查清單

本清單是上線前人工確認項目。程式碼完成與建置通過，不代表以下外部服務已完成設定。

## Cloudflare 與網域

- 人工檢查 `@` 與 `www` 兩筆網站記錄是否指向唯一的正式 Vercel 專案；若使用 CNAME，建議先採 **DNS only**，避免 Proxy 與 Vercel 網域驗證／TLS 互相干擾。
- 不要修改 Google Workspace MX、Google 驗證 TXT、DKIM、SPF 或 DMARC 記錄。
- SSL/TLS 是否有效且強制 HTTPS；`www` 與裸網域只有一個 canonical 版本。
- Cloudflare Redirect Rules、Cache Rules 與 WAF 未阻擋 Next.js 靜態資源、表單 API 或搜尋引擎。
- DNSSEC、CAA 與憑證續期通知符合現行管理方式。

## Vercel

- 目前可能同時存在 `bibeck-website` 與 `bibeck-website-we9s`：人工確認唯一 Production Project。
- 非正式專案應移除 GitHub integration 或刪除，避免每次 commit 觸發雙重部署；環境變數只維護一套。
- Production Branch 為 `main`，Framework Preset 為 Next.js，Output Directory 留空。
- Build Command 使用 `pnpm build`（實際執行 `next build`），Install Command 使用鎖檔。
- `bibeck.com` 只綁定唯一正式專案，Preview URL 不作 canonical。
- `EMAIL_PROVIDER_API_KEY`、寄件來源與收件信箱等環境變數僅存在伺服器端。
- 表單 API 的執行區域、逾時、附件大小與供應商限制已實際驗證。

## Email 與高交易量申請

- 寄件網域完成 SPF、DKIM、DMARC；正式寄件來源已由郵件供應商驗證。
- `support@bibeck.com` 可收件，錯誤通知與重試流程有人負責。
- 附件目前透過郵件傳送，尚未設定私有物件儲存與正式保留期限；不得對外宣稱已保存於私有儲存。
- 若未來保存附件，必須先完成私有 bucket、存取權限、加密、保留／刪除期限與資料主體請求流程。

## 第三方連結與營運事實

- 確認 `bybackoffice.com` 的實際營運者、與 BiBeck／Bybit 的關係、登入安全與隱私條款；在確認前一律描述為第三方合作夥伴返傭後台，不得描述為 Bybit 官方後台。
- 定期檢查 Bybit 推薦連結、費率來源、身分轉移說明與後台登入網址是否有效。
- 所有外部連結警示顯示正確網域，且不要求密碼、驗證碼、API Secret、私鑰或助記詞。

## SEO 與驗收

- Google Search Console 驗證網域並提交 `https://bibeck.com/sitemap.xml`。
- 檢查 robots、canonical、Open Graph、FAQ 結構化資料與繁體中文單一路由。
- 舊 `/en`、`/ja`、`/ko`、`/zh-cn`、`/zh-tw` URL 使用 308 導向不含語系前綴的對應頁。
- 最終 canonical 統一為 `https://bibeck.com`，並由外部平台將 `https://www.bibeck.com` 永久導向 apex。
- 於 320、375、768、1024、1440 px 檢查 Header、設定選單、計算器、法律頁與表單。
