import type { LocaleCode } from "../config/locales.ts";
import zhTW from "./zh-TW.json";

export type MessageKey = keyof typeof zhTW;
export type MessageSet = Record<MessageKey, string>;

export const messages: Record<LocaleCode, MessageSet> = { "zh-TW": zhTW };

export function getDictionary(locale: LocaleCode): MessageSet {
  return messages[locale];
}
