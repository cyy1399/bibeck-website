"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef } from "react";
import { PLATFORM_DIRECTORY } from "@/config/platforms";
import { navigationMenuReducer } from "@/lib/navigation-menu";

export function DesktopExchangeMenu() {
  const [isOpen, dispatch] = useReducer(navigationMenuReducer, false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target) || dropdownRef.current?.contains(target)) return;
      dispatch("close");
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      dispatch("close");
      triggerRef.current?.focus();
    }

    function handleBreakpointChange(event: MediaQueryListEvent) {
      if (event.matches) dispatch("close");
    }

    const mobileBreakpoint = window.matchMedia("(max-width: 1023px)");
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    mobileBreakpoint.addEventListener("change", handleBreakpointChange);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      mobileBreakpoint.removeEventListener("change", handleBreakpointChange);
    };
  }, [isOpen]);

  const closeMenu = () => dispatch("close");

  return (
    <div className="platform-menu relative">
      <button
        ref={triggerRef}
        type="button"
        className={`nav-link flex items-center gap-2 ${isOpen ? "text-gold" : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls="exchange-comparison-menu"
        onClick={() => dispatch("toggle")}
      >
        交易所
        <span className={`platform-chevron ${isOpen ? "platform-chevron-open" : ""}`} aria-hidden="true" />
      </button>
      {isOpen ? (
        <div ref={dropdownRef} id="exchange-comparison-menu" role="menu" className="platform-menu-panel absolute left-1/2 top-[calc(100%+12px)] z-50 w-80 -translate-x-1/2 border border-white/12 bg-[#101010] p-2 shadow-2xl">
          <Link role="menuitem" href="/platforms" onClick={closeMenu} className="block border-b border-white/10 px-4 py-3 text-xs font-semibold text-white/70 transition hover:text-gold">
            查看交易所總覽
          </Link>
          {PLATFORM_DIRECTORY.map((platform) => (
            <Link key={platform.href} role="menuitem" href={platform.href} onClick={closeMenu} className={`block border-l-2 px-4 py-3 transition hover:bg-white/[0.035] ${platform.supported ? "border-gold" : "border-white/10"}`}>
              <span className="flex items-center justify-between gap-4 text-sm font-semibold text-white"><span>{platform.name}</span><span className={`text-[0.68rem] font-medium ${platform.supported ? "text-gold" : "text-white/46"}`}>{platform.status}</span></span>
              <span className="mt-1 block text-xs leading-5 text-white/46">{platform.summary}</span>
              {!platform.supported ? <span className="mt-1 block text-[0.68rem] text-white/30">暫無 BiBeck 返傭</span> : null}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
