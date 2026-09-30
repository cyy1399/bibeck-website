# Rule Coverage Matrix

本矩陣是規格追溯，不代表規則已被可執行引擎驗證。Synthetic／Collision suites 目前標記為 `STRUCTURE_ONLY`；`AUD-B002` 解決前不可宣稱 decision behavior coverage。

| Rule | Provenance | Synthetic tests | Collision tests | Adversarial tests | 主要 failure modes |
|---|---|---|---|---|---|
| R-001 | EV-004 | 006, 010, 013, 019, 022 | — | 010, 014 | 猜測未知值；unknown 未傳播；未知目標被轉成風險建議 |
| R-002 | AS-002, AS-003 | 003 | 001 | — | 逾期被成長 claim 排擠；基本生活資源被耗盡 |
| R-003 | EV-003 | 001 | 001 | 012, 014 | 高收入掩蓋負現金流；時間基準不一致；重複扣款 |
| R-004 | EV-002, AS-003 | 002, 004 | — | 011 | 高淨值掩蓋近期缺口；保留資金被當可用 |
| R-005 | AS-001, AS-004 | 008 | 002 | 009, 011 | 低信心門檻洩漏成事實；流動性與最低還款衝突 |
| R-006 | AS-004 | 007 | 002 | 008, 009 | 通用利率門檻；忽略促銷到期、變動利率、提前清償成本 |
| R-007 | EV-002 | 005 | — | — | 保留資本同時計入安全資本；期間範圍不明 |
| R-008 | EV-001 | 024 | — | 001–004 | 不同 ID 指向同一底層資產；收入與資源重複；目標資金重複 |
| R-009 | EV-007, AS-003 | 014 | 003 | — | 目標資金同時計入長期資本；未顯示選擇後果 |
| R-010 | EV-004, AS-003 | 015, 016 | 003 | — | 系統替使用者決定人生意義；以投資風險解決不可能目標 |
| R-011 | EV-007 | 011 | 004 | 015 | 道德化可支配消費；沒有衝突仍製造任務 |
| R-012 | EV-005, AS-007 | 009, 021 | — | — | 負淨值單獨觸發危急；忽略同時存在的硬性 claim |
| R-013 | EV-006 | 020 | — | 007 | 零收入自動 SURVIVAL；忽略提款與支持資源 |
| R-014 | AS-005, AS-006, AS-008 | 012, 017, 018 | — | 015 | 健康狀態製造假任務；未解決 claim 被遺漏 |
| R-015 | EV-003, EV-004 | 023 | — | — | 矛盾資料仍產生高信心配置；material threshold 未定 |

## Coverage gaps

- 所有 Rule 均有 provenance、至少一個 fixture reference 與 failure-mode entry。
- R-007、R-009、R-010、R-012、R-015 尚缺專門的 executable adversarial oracle；目前只具結構案例。
- `AUD-B001` 與 `AUD-B005` 使多規則組合 coverage 無法成立。
- 所有 assumptions 都有 rule consumer；但 AS-005／AS-006 是 UX，而非金融證據。
- 所有 terminology 都有 audit recommendation，但目前沒有穩定 copy key 對應產品使用點；這是 `AUD-M002` 的一部分。
