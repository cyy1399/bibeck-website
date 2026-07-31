"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { externalDestinationFor } from "@/config/links";

type ExternalLinkProps = { href: string; children: ReactNode; className?: string; variant?: "primary" | "secondary" | "ghost"; sponsored?: boolean };

export function ExternalLink({ href, children, className = "", variant = "primary", sponsored = true }: ExternalLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const destination = externalDestinationFor(href);
  const variants = {
    primary: "border-gold bg-gold text-[#0A0A0A] shadow-[0_16px_42px_rgba(212,175,55,0.12)] hover:border-[#E8C766] hover:bg-[#E8C766]",
    secondary: "border-white/16 bg-transparent text-white hover:border-gold/70 hover:text-gold",
    ghost: "border-transparent bg-transparent text-white/72 hover:text-gold",
  };

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape") { setIsOpen(false); triggerRef.current?.focus(); } }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  function warn(event: MouseEvent<HTMLAnchorElement>) { event.preventDefault(); setIsOpen(true); }

  return <>
    <a ref={triggerRef} href={href} onClick={warn} rel={sponsored ? "noopener noreferrer sponsored" : "noopener noreferrer"} className={`cta-button inline-flex min-h-12 items-center justify-center rounded-sm border px-6 text-sm font-semibold tracking-[0.06em] transition duration-300 ${variants[variant]} ${className}`}>
      {children}<span className="ml-2 text-xs" aria-hidden="true">↗</span>
    </a>
    {isOpen ? <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-5" onPointerDown={(event) => { if (event.currentTarget === event.target) setIsOpen(false); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="external-link-title" className="w-full max-w-lg border border-white/14 bg-[#111] p-6 shadow-2xl sm:p-8">
        <p className="eyebrow">第三方網站提醒</p>
        <h2 id="external-link-title" className="mt-4 text-2xl font-semibold text-white">即將前往 {destination.serviceName}</h2>
        <p className="mt-4 text-sm text-secondary">目的網域：<strong className="font-mono text-white">{destination.domain}</strong></p>
        <p className="mt-4 text-sm leading-7 text-secondary">此為第三方網站。請確認網址後再登入。BiBeck 不會要求你提供密碼、驗證碼、API Secret、私鑰或助記詞。</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button type="button" className="cta-button button-secondary" onClick={() => { setIsOpen(false); triggerRef.current?.focus(); }}>留在 BiBeck</button>
          <a href={href} target="_blank" rel={sponsored ? "noopener noreferrer sponsored" : "noopener noreferrer"} className="cta-button button-primary" onClick={() => setIsOpen(false)}>確認並前往</a>
        </div>
      </div>
    </div> : null}
  </>;
}
