export type PlatformDirectoryItem = {
  name: string;
  href: string;
  status: string;
  supported: boolean;
  summary: string;
};

export const PLATFORM_DIRECTORY: PlatformDirectoryItem[] = [
  {
    name: "Bybit",
    href: "/platform/bybit",
    status: "返傭服務支援",
    supported: true,
    summary: "交易費率、資金費用與 BiBeck 返傭流程。",
  },
  {
    name: "Binance",
    href: "/platform/binance",
    status: "資訊整理",
    supported: false,
    summary: "現貨費率、BNB 抵扣與 VIP 等級重點。",
  },
  {
    name: "BingX",
    href: "/platform/bingx",
    status: "資訊整理",
    supported: false,
    summary: "現貨、永續合約與資金費用摘要。",
  },
  {
    name: "Bitget",
    href: "/platform/bitget",
    status: "資訊整理",
    supported: false,
    summary: "現貨、合約、BGB 抵扣與提領成本摘要。",
  },
  {
    name: "OKX",
    href: "/platform/okx",
    status: "資訊整理",
    supported: false,
    summary: "Maker／Taker、VIP 費率與合約成本摘要。",
  },
];
