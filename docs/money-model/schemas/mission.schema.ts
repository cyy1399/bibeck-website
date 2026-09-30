export type MissionType = "DISCOVER" | "DECIDE" | "REPAIR" | "BUILD" | "LEARN" | "OPTIMIZE";
export type MissionStatus = "TODO" | "IN_PROGRESS" | "USER_REPORTED_DONE" | "VERIFIED_DONE" | "NOT_APPLICABLE";
export type MissionVerificationType = "USER_CONFIRMATION" | "STATE_RECALCULATION" | "DOCUMENTED_VALUE" | "EXTERNAL_VERIFICATION" | "NOT_VERIFIABLE";
export interface MissionVerification { type:MissionVerificationType; requirementCodes:string[]; verifiedBy?:"USER"|"SYSTEM"|"EXTERNAL_SOURCE"; evidenceRefs:string[] }
export interface Mission { id:string; type:MissionType; code:string; params:Record<string,string|number|boolean|null>; whyCode:string; actionCode:string; impactCode:string; verification:MissionVerification; status:MissionStatus }
