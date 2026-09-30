import type { EvidenceRecord } from "../schemas/index.ts";
export const evidence: EvidenceRecord[] = [
  { id:"EV-001", topic:"Resource conservation", claim:"配置總額不能超過可用資源。", evidenceType:"MATHEMATICAL_DERIVATION", evidenceStrength:"STRONG", supports:["R-008"], doesNotSupport:["任何特定投資建議"], limitations:[], requiresVerification:false, notes:"由資源守恆直接導出。" },
  { id:"EV-002", topic:"Reserved capital", claim:"已保留給必要義務或目標的資本不能同時完整計入安全流動性。", evidenceType:"DEFINITION", evidenceStrength:"STRONG", supports:["R-007"], doesNotSupport:["任意安全資金門檻"], limitations:["須明確標記保留範圍與期限"], requiresVerification:false, notes:"Money Model 的資本用途定義。" },
  { id:"EV-003", topic:"Cash-flow identity", claim:"核心現金流是可用收入減去核心流出。", evidenceType:"MATHEMATICAL_DERIVATION", evidenceStrength:"STRONG", supports:["R-003","R-015"], doesNotSupport:["使用者未提供值的推估"], limitations:[], requiresVerification:false, notes:"算術恆等式。" },
  { id:"EV-004", topic:"Unknown data", claim:"未知必要資訊無法支持高信心的確定配置。", evidenceType:"DEFINITION", evidenceStrength:"STRONG", supports:["R-001","R-010"], doesNotSupport:["猜測缺漏值"], limitations:[], requiresVerification:false, notes:"資料品質與來源規範。" },
  { id:"EV-005", topic:"Net worth interpretation", claim:"淨值是狀態指標，不單獨決定當前優先事項。", evidenceType:"DEFINITION", evidenceStrength:"STRONG", supports:["R-012"], doesNotSupport:["忽略現金流或逾期"], limitations:[], requiresVerification:false, notes:"V1 指標邊界。" },
  { id:"EV-006", topic:"Income interpretation", claim:"收入為零不代表必然處於生存危機，仍需看流動資源與義務。", evidenceType:"MATHEMATICAL_DERIVATION", evidenceStrength:"STRONG", supports:["R-013"], doesNotSupport:["無條件判定財務健康"], limitations:[], requiresVerification:false, notes:"狀態必須由多個已知變數共同判斷。" },
  { id:"EV-007", topic:"User choice", claim:"可支配消費與生活目標包含使用者價值選擇，不應被系統道德化。", evidenceType:"USER_CHOICE", evidenceStrength:"MODERATE", supports:["R-011","R-009"], doesNotSupport:["忽略硬性或保護性主張"], limitations:["資源不足時仍須顯示取捨"], requiresVerification:false, notes:"產品行為邊界。" },
];
