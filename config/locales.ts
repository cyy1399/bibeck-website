export const localeCodes = ["zh-TW", "zh-CN", "en", "ja", "ko"] as const;
export type LocaleCode = (typeof localeCodes)[number];
export const DEFAULT_LOCALE: LocaleCode = "zh-TW";

export const locales = [
  { code: "zh-TW", slug: "", label: "繁體中文", shortLabel: "繁中", htmlLang: "zh-Hant-TW", openGraphLocale: "zh_TW" },
  { code: "zh-CN", slug: "zh-cn", label: "简体中文", shortLabel: "简中", htmlLang: "zh-Hans-CN", openGraphLocale: "zh_CN" },
  { code: "en", slug: "en", label: "English", shortLabel: "EN", htmlLang: "en", openGraphLocale: "en_US" },
  { code: "ja", slug: "ja", label: "日本語", shortLabel: "日本語", htmlLang: "ja", openGraphLocale: "ja_JP" },
  { code: "ko", slug: "ko", label: "한국어", shortLabel: "한국어", htmlLang: "ko", openGraphLocale: "ko_KR" },
] as const;

export function isLocaleCode(value: string | null): value is LocaleCode {
  return value !== null && localeCodes.includes(value as LocaleCode);
}

export function localeFromSlug(slug: string): LocaleCode | null {
  return locales.find((locale) => locale.slug === slug)?.code ?? null;
}

export function localizePath(pathname: string, locale: LocaleCode): string {
  const withoutLocale = pathname.replace(/^\/(en|ja|ko|zh-cn)(?=\/|$)/, "") || "/";
  const slug = locales.find((item) => item.code === locale)?.slug ?? "";
  return slug ? `/${slug}${withoutLocale === "/" ? "" : withoutLocale}` : withoutLocale;
}
