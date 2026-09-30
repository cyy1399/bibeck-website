import type { Confidence, Severity, Stage } from "./common.ts";
import type { Mission } from "./mission.schema.ts";
export interface DecisionMetric { id: string; label: string; value: number | string; unit?: string; confidence: Confidence }
export interface DecisionOption { id: string; title: string; consequence: string }
export interface DecisionOutput { currentStage: Stage; primaryBottleneck: string; severity: Severity; metrics: DecisionMetric[]; mainQuest: Mission | null; sideMissions: Mission[]; options: DecisionOption[]; reasoning: string[]; assumptions: string[]; missingInformation: string[]; modelVersions: string[] }
