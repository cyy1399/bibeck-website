import {
  BINANCE_FEE_GUIDE,
  BINANCE_FEE_STRUCTURE,
  BINGX_FEE_CENTER,
  BINGX_SPOT_FEE_RULES,
  BITGET_FEE_CENTER,
  BITGET_FEE_GUIDE,
  BYBIT_FEE_STRUCTURE,
  BYBIT_FUNDING_FEE,
  OKX_FEE_RULES,
  OKX_FUTURES_FEE_GUIDE,
} from "@/config/links";
import { BIBECK_BYBIT_REBATE_RATE } from "@/config/rebate";

export type ExchangeSlug = "bybit" | "binance" | "bingx" | "bitget" | "okx";

export interface FeeRate {
  maker: number | null;
  taker: number | null;
}

export interface ExchangeProductFee {
  id: string;
  name: string;
  category: "spot" | "futures" | "options";
  fee: FeeRate;
  notes?: string;
}

export interface VipTier {
  level: string;
  volumeRequirement?: string;
  assetRequirement?: string;
  spotMaker?: number | null;
  spotTaker?: number | null;
  futuresMaker?: number | null;
  futuresTaker?: number | null;
}

export interface OfficialSource {
  label: string;
  url: string;
}

export interface ExchangeData {
  slug: ExchangeSlug;
  name: string;
  heroTitle: string;
  description: string;
  menuDescription: string;
  menuStatus: "返傭支援" | "費率比較";
  serviceStatus: "rebate-supported" | "information-only";
  serviceStatusLabel: string;
  lastUpdated: string;
  officialSources: OfficialSource[];
  products: ExchangeProductFee[];
  vipTiers: VipTier[];
  rebateRate?: number | null;
  summary: string;
  spotSummaryProductId: string;
  futuresSummaryProductId: string;
}

export const EXCHANGE_ORDER: ExchangeSlug[] = ["bybit", "binance", "bingx", "bitget", "okx"];

export const EXCHANGES: Record<ExchangeSlug, ExchangeData> = {
  bybit: {
    slug: "bybit",
    name: "Bybit",
    heroTitle: "Bybit 交易手續費、VIP 等級與 BiBeck 返傭",
    description: "了解 Bybit 現貨與合約費率、VIP 優惠及 BiBeck 返傭後的實際交易成本。",
    menuDescription: "手續費、VIP 與 BiBeck 返傭",
    menuStatus: "返傭支援",
    serviceStatus: "rebate-supported",
    serviceStatusLabel: "返傭服務支援",
    lastUpdated: "2026-07-28",
    officialSources: [
      { label: "Bybit 官方手續費與 VIP 說明", url: BYBIT_FEE_STRUCTURE },
      { label: "Bybit 官方資金費用說明", url: BYBIT_FUNDING_FEE },
    ],
    products: [
      { id: "spot", name: "現貨", category: "spot", fee: { maker: 0.001, taker: 0.001 }, notes: "VIP 0 加密貨幣現貨基礎費率" },
      { id: "usdt-perpetual", name: "USDT 永續與交割合約", category: "futures", fee: { maker: 0.0002, taker: 0.00055 }, notes: "VIP 0 永續與交割合約基礎費率" },
      { id: "usdc-contract", name: "USDC 永續與交割合約", category: "futures", fee: { maker: 0.0002, taker: 0.00055 }, notes: "依官方永續與交割合約費率分類" },
      { id: "options", name: "選擇權", category: "options", fee: { maker: 0.0002, taker: 0.0003 }, notes: "VIP 0 基礎費率" },
    ],
    vipTiers: [
      { level: "VIP 0", volumeRequirement: "未達 VIP 1 門檻", assetRequirement: "無最低資產門檻", spotMaker: 0.001, spotTaker: 0.001, futuresMaker: 0.0002, futuresTaker: 0.00055 },
      { level: "VIP 1", volumeRequirement: "現貨 ≥ US$1M 或衍生品 ≥ US$10M", assetRequirement: "≥ US$100K", spotMaker: 0.000675, spotTaker: 0.0008, futuresMaker: 0.00018, futuresTaker: 0.0004 },
      { level: "VIP 2", volumeRequirement: "現貨 ≥ US$5M 或衍生品 ≥ US$25M", assetRequirement: "≥ US$250K", spotMaker: 0.00065, spotTaker: 0.000775, futuresMaker: 0.00016, futuresTaker: 0.000375 },
      { level: "VIP 3", volumeRequirement: "現貨 ≥ US$10M 或衍生品 ≥ US$50M", assetRequirement: "≥ US$500K", spotMaker: 0.000625, spotTaker: 0.00075, futuresMaker: 0.00014, futuresTaker: 0.00035 },
      { level: "VIP 4", volumeRequirement: "現貨 ≥ US$25M 或衍生品 ≥ US$100M", assetRequirement: "≥ US$1M", spotMaker: 0.0005, spotTaker: 0.0006, futuresMaker: 0.00012, futuresTaker: 0.00032 },
      { level: "VIP 5", volumeRequirement: "現貨 ≥ US$50M 或衍生品 ≥ US$250M", assetRequirement: "≥ US$2M", spotMaker: 0.0004, spotTaker: 0.0005, futuresMaker: 0.0001, futuresTaker: 0.00032 },
      { level: "Supreme VIP", volumeRequirement: "現貨 ≥ US$100M 或衍生品 ≥ US$500M", assetRequirement: "不適用", spotMaker: 0.0003, spotTaker: 0.00045, futuresMaker: 0, futuresTaker: 0.0003 },
    ],
    rebateRate: BIBECK_BYBIT_REBATE_RATE,
    summary: "透過 BiBeck 註冊 Bybit，可在符合合作方案條件下取得部分交易手續費返傭，進一步降低實際交易成本。",
    spotSummaryProductId: "spot",
    futuresSummaryProductId: "usdt-perpetual",
  },
  binance: {
    slug: "binance",
    name: "Binance",
    heroTitle: "Binance 交易手續費與 VIP 等級",
    description: "整理 Binance 現貨、合約、BNB 手續費折扣與 VIP 費率，協助你比較表面費率與實際交易成本。",
    menuDescription: "現貨、合約、BNB 折扣與 VIP",
    menuStatus: "費率比較",
    serviceStatus: "information-only",
    serviceStatusLabel: "目前僅提供費率資訊",
    lastUpdated: "2026-07-28",
    officialSources: [
      { label: "Binance 官方手續費與 VIP 說明", url: BINANCE_FEE_STRUCTURE },
      { label: "Binance 官方手續費計算指南", url: BINANCE_FEE_GUIDE },
    ],
    products: [
      { id: "spot", name: "現貨", category: "spot", fee: { maker: 0.001, taker: 0.001 }, notes: "一般用戶，未計 BNB 抵扣" },
      { id: "usdt-perpetual", name: "USDT 永續合約", category: "futures", fee: { maker: null, taker: null }, notes: "請以 Binance 帳戶當前費率為準" },
      { id: "usdc-contract", name: "USDC 合約", category: "futures", fee: { maker: null, taker: null }, notes: "資料待確認" },
      { id: "options", name: "選擇權", category: "options", fee: { maker: null, taker: null }, notes: "資料待確認" },
    ],
    vipTiers: [
      { level: "一般用戶", volumeRequirement: "< US$1M", assetRequirement: "≥ 0 BNB", spotMaker: 0.001, spotTaker: 0.001, futuresMaker: null, futuresTaker: null },
      { level: "VIP 1", volumeRequirement: "≥ US$1M", assetRequirement: "≥ 5 BNB", spotMaker: 0.0009, spotTaker: 0.001, futuresMaker: null, futuresTaker: null },
      { level: "VIP 2", volumeRequirement: "≥ US$5M", assetRequirement: "≥ 25 BNB", spotMaker: 0.0008, spotTaker: 0.001, futuresMaker: null, futuresTaker: null },
      { level: "VIP 3", volumeRequirement: "≥ US$20M", assetRequirement: "≥ 100 BNB", spotMaker: 0.0004, spotTaker: 0.0006, futuresMaker: null, futuresTaker: null },
      { level: "VIP 4", volumeRequirement: "≥ US$75M", assetRequirement: "≥ 500 BNB", spotMaker: 0.0004, spotTaker: 0.00052, futuresMaker: null, futuresTaker: null },
      { level: "VIP 5", volumeRequirement: "≥ US$150M", assetRequirement: "≥ 1,000 BNB", spotMaker: 0.00025, spotTaker: 0.00031, futuresMaker: null, futuresTaker: null },
      { level: "VIP 6", volumeRequirement: "≥ US$400M", assetRequirement: "≥ 1,750 BNB", spotMaker: 0.0002, spotTaker: 0.00029, futuresMaker: null, futuresTaker: null },
      { level: "VIP 7", volumeRequirement: "≥ US$800M", assetRequirement: "≥ 3,000 BNB", spotMaker: 0.00019, spotTaker: 0.00028, futuresMaker: null, futuresTaker: null },
      { level: "VIP 8", volumeRequirement: "≥ US$2B", assetRequirement: "≥ 4,500 BNB", spotMaker: 0.00016, spotTaker: 0.00025, futuresMaker: null, futuresTaker: null },
      { level: "VIP 9", volumeRequirement: "≥ US$4B", assetRequirement: "≥ 5,500 BNB", spotMaker: 0.00011, spotTaker: 0.00023, futuresMaker: null, futuresTaker: null },
    ],
    rebateRate: 0,
    summary: "Binance 的基礎現貨費率與 BNB 折扣具備競爭力，但 BiBeck 目前尚未提供 Binance 返傭服務。若你重視返傭後的實際交易成本，可以進一步比較 Bybit + BiBeck。",
    spotSummaryProductId: "spot",
    futuresSummaryProductId: "usdt-perpetual",
  },
  bingx: {
    slug: "bingx",
    name: "BingX",
    heroTitle: "BingX 交易手續費與 VIP 資訊",
    description: "整理 BingX 現貨、永續合約與 VIP 費率資訊，協助你估算實際交易成本。",
    menuDescription: "現貨、合約與 VIP 費率資訊",
    menuStatus: "費率比較",
    serviceStatus: "information-only",
    serviceStatusLabel: "目前僅提供費率資訊",
    lastUpdated: "2026-07-28",
    officialSources: [
      { label: "BingX 官方費用中心", url: BINGX_FEE_CENTER },
      { label: "BingX 官方現貨費率規則", url: BINGX_SPOT_FEE_RULES },
    ],
    products: [
      { id: "spot", name: "現貨", category: "spot", fee: { maker: 0.001, taker: 0.001 }, notes: "常見交易對；實際依幣對顯示" },
      { id: "usdt-perpetual", name: "USDT 永續合約", category: "futures", fee: { maker: 0.0002, taker: 0.0005 }, notes: "依官方費率資料整理" },
      { id: "usdc-contract", name: "USDC 合約", category: "futures", fee: { maker: null, taker: null }, notes: "資料待確認" },
      { id: "options", name: "選擇權", category: "options", fee: { maker: null, taker: null }, notes: "資料待確認" },
    ],
    vipTiers: [],
    rebateRate: 0,
    summary: "BiBeck 目前尚未提供 BingX 返傭。你可以先用公開費率估算成本，再與 Bybit + BiBeck 的輸入條件客觀比較。",
    spotSummaryProductId: "spot",
    futuresSummaryProductId: "usdt-perpetual",
  },
  bitget: {
    slug: "bitget",
    name: "Bitget",
    heroTitle: "Bitget 交易手續費與 BGB 折扣",
    description: "整理 Bitget 現貨、合約、BGB 手續費折扣與 VIP 資訊，協助你估算實際交易成本。",
    menuDescription: "現貨、合約與 BGB 折扣資訊",
    menuStatus: "費率比較",
    serviceStatus: "information-only",
    serviceStatusLabel: "目前僅提供費率資訊",
    lastUpdated: "2026-07-28",
    officialSources: [
      { label: "Bitget 官方費用說明", url: BITGET_FEE_GUIDE },
      { label: "Bitget 官方費率中心", url: BITGET_FEE_CENTER },
    ],
    products: [
      { id: "spot", name: "現貨", category: "spot", fee: { maker: 0.001, taker: 0.001 }, notes: "未計 BGB 支付折扣" },
      { id: "usdt-perpetual", name: "USDT 永續合約", category: "futures", fee: { maker: 0.0002, taker: 0.0006 }, notes: "一般合約基礎費率" },
      { id: "usdc-contract", name: "USDC 合約", category: "futures", fee: { maker: null, taker: null }, notes: "資料待確認" },
      { id: "options", name: "選擇權", category: "options", fee: { maker: null, taker: null }, notes: "資料待確認" },
    ],
    vipTiers: [],
    rebateRate: 0,
    summary: "BiBeck 目前尚未提供 Bitget 返傭。BGB 折扣可能影響現貨成本，仍應把實際折扣條件、合約費率與其他成本一起比較。",
    spotSummaryProductId: "spot",
    futuresSummaryProductId: "usdt-perpetual",
  },
  okx: {
    slug: "okx",
    name: "OKX",
    heroTitle: "OKX 交易手續費與 VIP 等級",
    description: "整理 OKX 掛單、吃單、VIP 與合約成本資訊，協助你估算實際交易成本。",
    menuDescription: "掛單、吃單、VIP 與成本資訊",
    menuStatus: "費率比較",
    serviceStatus: "information-only",
    serviceStatusLabel: "目前僅提供費率資訊",
    lastUpdated: "2026-07-28",
    officialSources: [
      { label: "OKX 官方交易費用規則", url: OKX_FEE_RULES },
      { label: "OKX 官方合約費用計算", url: OKX_FUTURES_FEE_GUIDE },
    ],
    products: [
      { id: "spot", name: "現貨", category: "spot", fee: { maker: null, taker: null }, notes: "費率依帳戶等級與交易對顯示" },
      { id: "usdt-perpetual", name: "USDT 永續合約", category: "futures", fee: { maker: null, taker: null }, notes: "費率依帳戶等級與產品顯示" },
      { id: "usdc-contract", name: "USDC 合約", category: "futures", fee: { maker: null, taker: null }, notes: "資料待確認" },
      { id: "options", name: "選擇權", category: "options", fee: { maker: null, taker: null }, notes: "資料待確認" },
    ],
    vipTiers: [],
    rebateRate: 0,
    summary: "BiBeck 目前尚未提供 OKX 返傭。OKX 費率依帳戶層級與產品而異，建議輸入帳戶實際費率後再進行方案比較。",
    spotSummaryProductId: "spot",
    futuresSummaryProductId: "usdt-perpetual",
  },
};

export function getExchange(slug: ExchangeSlug): ExchangeData {
  return EXCHANGES[slug];
}

export function formatFeeRate(rate: number | null | undefined, digits = 4): string {
  if (rate === null || rate === undefined) return "待確認";
  const trimmed = (rate * 100).toFixed(digits).replace(/0+$/, "").replace(/\.$/, "");
  const [integer, decimals = ""] = (trimmed || "0").split(".");
  return integer + "." + decimals.padEnd(2, "0") + "%";
}