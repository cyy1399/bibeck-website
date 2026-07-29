# Currency and language preferences

## Current rollout (v2)

- The canonical default remains `https://bibeck.com` in Traditional Chinese (`zh-TW`). English, Japanese, Korean and Simplified Chinese are published under `/en`, `/ja`, `/ko` and `/zh-cn`.
- Currency and language preferences are saved under `bibeck.currency` and `bibeck.locale`; locale is also stored in a first-party cookie so routing can retain the language across navigation.
- The first client render uses `USDT` and `zh-TW`, then restores saved preferences after hydration. This prevents server/client markup mismatches.
- Currency conversion is based on bundled fallback estimates and is always labelled as an estimate, not a live market quote. Trading calculations continue to use USDT as their base unit.
- Shared navigation, footer, settings, primary page heroes, calculator fields and calculator monetary results use JSON dictionaries. Locale routes are statically generated through the App Router.

## SEO strategy

Every published locale route receives a locale-specific canonical, Open Graph locale, Twitter title/description and `hreflang` set including `x-default`. The sitemap includes each language URL and its language alternates. The default language intentionally remains unprefixed.

## Exchange-rate provider boundary

`config/currencies.ts` owns supported currencies and the fallback rate policy. A future provider may replace `unitsPerUsdt` values with server-fetched, cached rates, but must include a source name and update timestamp and must fall back safely when unavailable.
