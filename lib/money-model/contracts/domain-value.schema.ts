import type { DataPoint } from "./common.ts";

export type DomainValue<T> =
  | { status:"KNOWN"; data:DataPoint<T> }
  | { status:"UNKNOWN"; reasonCode:string }
  | { status:"NOT_APPLICABLE"; reasonCode:string };

export const known = <T>(value:T, updatedAt="2026-10-01"):DomainValue<T> => ({ status:"KNOWN", data:{ value,source:"CALCULATED",updatedAt } });
export const unknown = <T>(reasonCode:string):DomainValue<T> => ({ status:"UNKNOWN",reasonCode });
export const notApplicable = <T>(reasonCode:string):DomainValue<T> => ({ status:"NOT_APPLICABLE",reasonCode });
