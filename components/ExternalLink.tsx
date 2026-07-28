import Link from "next/link";
import type { ReactNode } from "react";

type ExternalLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
};

export function ExternalLink({
  href,
  children,
  className = "",
  variant = "primary",
}: ExternalLinkProps) {
  const variants = {
    primary:
      "border-gold bg-gold text-[#0A0A0A] shadow-[0_16px_42px_rgba(212,175,55,0.12)] hover:border-[#E8C766] hover:bg-[#E8C766]",
    secondary:
      "border-white/16 bg-transparent text-white hover:border-gold/70 hover:text-gold",
    ghost:
      "border-transparent bg-transparent text-white/72 hover:text-gold",
  };

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-12 items-center justify-center rounded-sm border px-6 text-sm font-semibold tracking-[0.06em] transition duration-300 ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
