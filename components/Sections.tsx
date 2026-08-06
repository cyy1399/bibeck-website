import type { ReactNode } from "react";
import { REBATE_APPLICATION_URL, REBATE_BACKOFFICE_URL } from "@/config/links";
import { ExternalLink } from "./ExternalLink";
import { bybitActionLabels } from "@/config/actions";

export function PageHero({
  eyebrow,
  title,
  copy,
  actions,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  actions?: ReactNode;
}) {
  return (
    <section className="page-hero relative border-b border-white/8 px-5 pb-20 pt-36 sm:px-8 lg:pb-24 lg:pt-44">
      <div className="mx-auto max-w-7xl">
        <p className="reveal eyebrow">{eyebrow}</p>
        <h1 className="reveal mt-7 max-w-4xl text-balance text-4xl font-semibold leading-[1.08] text-white sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="reveal mt-7 max-w-2xl text-lg leading-9 text-secondary">{copy}</p>
        {actions ? <div className="reveal mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
      </div>
    </section>
  );
}

export function CTAGroup() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <ExternalLink href={REBATE_APPLICATION_URL} sponsored>{bybitActionLabels.rebateSignup}</ExternalLink>
      <ExternalLink href={REBATE_BACKOFFICE_URL} variant="secondary">
        {bybitActionLabels.rebateDashboard}
      </ExternalLink>
    </div>
  );
}

export function SectionTitle({
  label,
  title,
  copy,
}: {
  label: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="reveal eyebrow">{label}</p>
      <h2 className="reveal mt-5 text-balance text-3xl font-semibold leading-tight text-white sm:text-5xl">
        {title}
      </h2>
      {copy ? <p className="reveal mt-5 text-lg leading-8 text-secondary">{copy}</p> : null}
    </div>
  );
}
