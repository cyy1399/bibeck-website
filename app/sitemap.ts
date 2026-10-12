import type {MetadataRoute} from "next";
import {brandConfig} from "@/config/brand";
import {lessons} from "@/config/trader-content";
export default function sitemap():MetadataRoute.Sitemap{return ['','/market','/tools','/tools/position','/tools/journal','/research','/learn',...lessons.map(l=>`/learn/${l.slug}`),'/exchanges','/community','/roadmap','/about','/calculator','/platform/bybit','/rebate/activate','/faq','/contact','/privacy','/terms','/affiliate-disclosure','/personal-data-notice'].map((p,i)=>({url:brandConfig.websiteUrl+p,changeFrequency:p==='/market'?'daily':'monthly',priority:i===0?1:.7}));}
