import { BYBIT_REGISTER, REBATE_LOGIN } from "@/config/links";
import { ExternalLink } from "./ExternalLink";

export function PageHero({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="page-hero relative border-b border-white/8 px-5 pb-20 pt-36 sm:px-8 lg:pb-24 lg:pt-44">
      <div className="mx-auto max-w-7xl">
        <p className="reveal eyebrow">{eyebrow}</p>
        <h1 className="reveal mt-7 max-w-4xl text-balance text-4xl font-semibold leading-[1.08] text-white sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="reveal mt-7 max-w-2xl text-lg leading-9 text-secondary">{copy}</p>
      </div>
    </section>
  );
}

export function CTAGroup() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <ExternalLink href={BYBIT_REGISTER}>透過 Bybit 註冊</ExternalLink>
      <ExternalLink href={REBATE_LOGIN} variant="secondary">
        返傭後台
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
