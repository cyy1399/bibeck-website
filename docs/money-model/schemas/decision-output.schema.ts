import type { Confidence, Severity, Stage } from "./common.ts";
import type { Mission } from "./mission.schema.ts";
import type { SemanticRef } from "./executable-rule.schema.ts";
export interface DecisionMetric { id:string; labelCode:string; value:number|string; unit?:string; confidence:Confidence }
export interface DecisionOption { id:string; code:string; params:Record<string,string|number|boolean|null>; consequenceCode:string; consequenceParams:Record<string,string|number|boolean|null> }
export interface DecisionOutput { currentStage:Stage; primaryBottleneck:SemanticRef; severity:Severity; metrics:DecisionMetric[]; mainQuest:Mission|null; sideMissions:Mission[]; options:DecisionOption[]; explanationRefs:SemanticRef[]; assumptionIds:string[]; missingInformation:SemanticRef[]; modelVersions:string[] }
