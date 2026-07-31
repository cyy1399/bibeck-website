export const localeCodes = ["zh-TW"] as const;
export type LocaleCode = (typeof localeCodes)[number];
export const DEFAULT_LOCALE: LocaleCode = "zh-TW";

export const locales = [
  { code: "zh-TW", slug: "", label: "繁體中文", shortLabel: "繁中", htmlLang: "zh-TW", openGraphLocale: "zh_TW" },
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
