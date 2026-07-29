# Currency and language preferences

## Current rollout

- The canonical site remains `https://bibeck.com` and the server-rendered default is Traditional Chinese (`zh-TW`).
- Currency and language preferences are client-side enhancements saved under `bibeck.currency` and `bibeck.locale` in local storage.
- The first client render uses `USDT` and `zh-TW`, then restores saved preferences after hydration. This prevents server/client markup mismatches.
- Currency conversion is based on bundled fallback estimates and is always labelled as an estimate, not a live market quote. Trading calculations continue to use USDT as their base unit.
- Header navigation, footer labels, settings UI, currency units and calculator monetary results react to preferences in this release. The message catalogue is intentionally centralized so remaining page copy can migrate without another state-management change.

## SEO strategy

This release does not publish `/zh-TW`, `/zh-CN`, `/en`, `/ja` or `/ko` routes. Adding hreflang entries for URLs that do not yet contain complete server-rendered translations would be misleading and could create duplicate canonical pages. Existing metadata, canonical URLs, Open Graph, JSON-LD, robots and sitemap therefore remain unchanged.

The next localization phase should move page content into the message catalogue, add locale route segments with translated server metadata, and only then publish `hreflang`, `x-default` and locale sitemap entries.

## Exchange-rate provider boundary

`config/currencies.ts` owns supported currencies and the fallback rate policy. A future provider may replace `unitsPerUsdt` values with server-fetched, cached rates, but must include a source name and update timestamp and must fall back safely when unavailable.
