"use client";

import { usePreferences } from "@/components/PreferencesProvider";
import type { MessageKey } from "@/messages";

export function TranslatedText({ message }: { message: MessageKey }) {
  const { t } = usePreferences();
  return <>{t(message)}</>;
}

export function LocalizedPageHero({ eyebrow, title, description }: { eyebrow: MessageKey; title: MessageKey; description: MessageKey }) {
  const { t } = usePreferences();
  return (
    <section className="page-hero relative border-b border-white/8 px-5 pb-20 pt-36 sm:px-8 lg:pb-24 lg:pt-44">
      <div className="mx-auto max-w-7xl">
        <p className="reveal eyebrow">{t(eyebrow)}</p>
        <h1 className="reveal mt-7 max-w-4xl text-balance text-4xl font-semibold leading-[1.08] text-white sm:text-6xl lg:text-7xl">{t(title)}</h1>
        <p className="reveal mt-7 max-w-2xl text-lg leading-9 text-secondary">{t(description)}</p>
      </div>
    </section>
  );
}
