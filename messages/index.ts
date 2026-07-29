import type { LocaleCode } from "../config/locales.ts";
import zhTW from "./zh-TW.json";
import zhCN from "./zh-CN.json";
import en from "./en.json";
import ja from "./ja.json";
import ko from "./ko.json";

export type MessageKey = keyof typeof zhTW;
export type MessageSet = Record<MessageKey, string>;

export const messages: Record<LocaleCode, MessageSet> = { "zh-TW": zhTW, "zh-CN": zhCN, en, ja, ko };

export function getDictionary(locale: LocaleCode): MessageSet {
  return messages[locale];
}
