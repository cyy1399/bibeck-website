import type { RegistryStatus } from "./common.ts";
export interface TerminologyRecord { key: string; internalName: string; zhTW: string; descriptionZhTW: string; status: RegistryStatus; notes: string }
