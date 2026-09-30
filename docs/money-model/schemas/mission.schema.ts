export type MissionType = "DISCOVER" | "DECIDE" | "REPAIR" | "BUILD" | "LEARN" | "OPTIMIZE";
export type MissionStatus = "TODO" | "IN_PROGRESS" | "USER_REPORTED_DONE" | "VERIFIED_DONE" | "NOT_APPLICABLE";
export interface Mission { id: string; type: MissionType; title: string; why: string; action: string; expectedImpact: string; verificationMethod: string; status: MissionStatus }
