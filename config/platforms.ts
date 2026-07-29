import { EXCHANGES, EXCHANGE_ORDER } from "@/config/exchanges";

export type PlatformDirectoryItem = {
  name: string;
  href: string;
  status: string;
  supported: boolean;
  summary: string;
};

export const PLATFORM_DIRECTORY: PlatformDirectoryItem[] = EXCHANGE_ORDER.map((slug) => {
  const exchange = EXCHANGES[slug];

  return {
    name: exchange.name,
    href: "/platform/" + exchange.slug,
    status: exchange.menuStatus,
    supported: exchange.serviceStatus === "rebate-supported",
    summary: exchange.menuDescription,
  };
});