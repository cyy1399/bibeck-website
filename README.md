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

## 高交易量申請寄信設定

複製 `.env.example` 並設定伺服器端環境變數：

```env
APPLICATION_EMAIL_TO=support@bibeck.com
APPLICATION_EMAIL_FROM=BiBeck Application <hello@bibeck.com>
EMAIL_PROVIDER_API_KEY=
```

`EMAIL_PROVIDER_API_KEY` 使用 Resend API Key。請勿使用 `NEXT_PUBLIC_` 前綴或將密鑰提交到版本庫。
