"use client";

import { useEffect, useRef, useState } from "react";
import { currencies, type CurrencyCode } from "@/config/currencies";
import { locales, type LocaleCode } from "@/config/locales";
import { usePreferences } from "@/components/PreferencesProvider";

export function SettingsMenu({ mobile = false }: { mobile?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [section, setSection] = useState<"currency" | "language">("currency");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { currency, locale, setCurrency, setLocale, t } = usePreferences();
  const localeDefinition = locales.find((item) => item.code === locale) ?? locales[0];

  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setIsOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${mobile ? "w-full" : ""}`}>
      <button
        ref={triggerRef}
        type="button"
        className={mobile ? "mobile-nav-link flex w-full items-center justify-between" : "nav-link flex items-center gap-2 whitespace-nowrap"}
        aria-label={t("settings.open")}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={mobile ? "mobile-preferences-menu" : "desktop-preferences-menu"}
        onClick={() => setIsOpen((value) => !value)}
      >
        <span>{t("settings.title")}</span>
        <span className="text-xs text-gold">{currency} · {localeDefinition.shortLabel}</span>
      </button>
      {isOpen ? (
        <div
          ref={panelRef}
          id={mobile ? "mobile-preferences-menu" : "desktop-preferences-menu"}
          role="dialog"
          aria-label={t("settings.title")}
          className={`${mobile ? "relative mt-1 w-full" : "absolute right-0 top-[calc(100%+12px)] z-[60] w-[22rem]"} border border-white/12 bg-[#101010] p-3 shadow-2xl`}
        >
          <div className="grid grid-cols-2 border border-white/10 p-1" role="tablist">
            <button type="button" role="tab" aria-selected={section === "currency"} className={`min-h-10 px-3 text-sm ${section === "currency" ? "bg-gold text-black" : "text-white/65"}`} onClick={() => setSection("currency")}>{t("settings.currency")}</button>
            <button type="button" role="tab" aria-selected={section === "language"} className={`min-h-10 px-3 text-sm ${section === "language" ? "bg-gold text-black" : "text-white/65"}`} onClick={() => setSection("language")}>{t("settings.language")}</button>
          </div>
          {section === "currency" ? (
            <div className="mt-3 grid max-h-72 grid-cols-2 gap-1 overflow-y-auto" role="radiogroup" aria-label={t("settings.currency")}>
              {currencies.map((item) => <Choice key={item.code} active={currency === item.code} label={item.code} detail={item.displayName} onClick={() => setCurrency(item.code as CurrencyCode)} />)}
            </div>
          ) : (
            <div className="mt-3 grid gap-1" role="radiogroup" aria-label={t("settings.language")}>
              {locales.map((item) => <Choice key={item.code} active={locale === item.code} label={item.label} detail={item.code} onClick={() => setLocale(item.code as LocaleCode)} />)}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Choice({ active, label, detail, onClick }: { active: boolean; label: string; detail: string; onClick: () => void }) {
  return <button type="button" role="radio" aria-checked={active} onClick={onClick} className={`flex min-h-12 items-center justify-between gap-2 border px-3 text-left ${active ? "border-gold bg-gold/8 text-gold" : "border-white/8 text-white/72 hover:border-white/20"}`}><span className="font-medium">{label}</span><span className="truncate text-[0.68rem] opacity-60">{detail}</span></button>;
}
