"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { currencies, type CurrencyCode } from "@/config/currencies";
import { useCurrency } from "@/components/PreferencesProvider";

export function SettingsMenu({ mobile = false }: { mobile?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { currency, setCurrency } = useCurrency();
  const pathname = usePathname();

  useEffect(() => {
    // A route change must collapse the persistent header menu.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

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
      <button ref={triggerRef} type="button" className={mobile ? "mobile-nav-link flex w-full items-center justify-between" : "nav-link whitespace-nowrap"} aria-label="開啟貨幣設定" aria-expanded={isOpen} aria-haspopup="dialog" aria-controls={mobile ? "mobile-currency-menu" : "desktop-currency-menu"} onClick={() => setIsOpen((value) => !value)}>
        設定
      </button>
      {isOpen ? (
        <div ref={panelRef} id={mobile ? "mobile-currency-menu" : "desktop-currency-menu"} role="dialog" aria-label="貨幣設定" className={`${mobile ? "relative mt-1 w-full" : "absolute right-0 top-[calc(100%+12px)] z-[60] w-[22rem]"} max-w-[calc(100vw-2rem)] border border-white/12 bg-[#101010] p-3 shadow-2xl`}>
          <p className="px-1 pb-3 text-sm font-semibold text-white">貨幣</p>
          <div className="grid max-h-72 grid-cols-2 gap-1 overflow-y-auto" role="radiogroup" aria-label="顯示貨幣">
            {currencies.map((item) => <Choice key={item.code} active={currency === item.code} label={item.code} detail={item.displayName} onClick={() => setCurrency(item.code as CurrencyCode)} />)}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Choice({ active, label, detail, onClick }: { active: boolean; label: string; detail: string; onClick: () => void }) {
  return <button type="button" role="radio" aria-checked={active} onClick={onClick} className={`flex min-h-12 items-center justify-between gap-2 border px-3 text-left ${active ? "border-gold bg-gold/8 text-gold" : "border-white/8 text-white/72 hover:border-white/20"}`}><span className="font-medium">{label}</span><span className="truncate text-[0.68rem] opacity-60">{detail}</span></button>;
}
