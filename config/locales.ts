export const localeCodes = ["zh-TW", "zh-CN", "en", "ja", "ko"] as const;
export type LocaleCode = (typeof localeCodes)[number];
export const DEFAULT_LOCALE: LocaleCode = "zh-TW";

export const locales = [
  { code: "zh-TW", label: "繁體中文", shortLabel: "繁中", htmlLang: "zh-Hant-TW" },
  { code: "zh-CN", label: "简体中文", shortLabel: "简中", htmlLang: "zh-Hans-CN" },
  { code: "en", label: "English", shortLabel: "EN", htmlLang: "en" },
  { code: "ja", label: "日本語", shortLabel: "日本語", htmlLang: "ja" },
  { code: "ko", label: "한국어", shortLabel: "한국어", htmlLang: "ko" },
] as const;

export function isLocaleCode(value: string | null): value is LocaleCode {
  return value !== null && localeCodes.includes(value as LocaleCode);
}
