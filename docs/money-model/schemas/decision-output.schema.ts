import type { Confidence, Severity, Stage } from "./common.ts";
import type { Mission } from "./mission.schema.ts";
import type { SemanticRef } from "./executable-rule.schema.ts";
import type { DomainValue } from "./domain-value.schema.ts";
import type { ValueRef } from "./predicate.schema.ts";
import type { ConfidenceAssessment, DecisionProvenance, EvaluationMetadata, RevisionRef, VersionRef } from "./provenance.schema.ts";
export interface DecisionMetric { id:ValueRef; labelCode:string; value:DomainValue<number|boolean|string|null>; unit:string; timeBasis:string; currency:string; confidence:ConfidenceAssessment; provenance:DecisionProvenance }
export interface DecisionFinding extends SemanticRef { id:string; provenance:DecisionProvenance; confidence:ConfidenceAssessment }
export interface DecisionBottleneck extends SemanticRef { provenance:DecisionProvenance }
export interface DecisionOption { id:string; code:string; params:Record<string,string|number|boolean|null>; consequenceCode:string; consequenceParams:Record<string,string|number|boolean|null>; provenance:DecisionProvenance }
export interface DecisionOutput { decisionOutputVersion:"1.0"; currentStage:Stage|null; primaryBottleneck:DecisionBottleneck|null; severity:Severity; confidence:Confidence; confidenceAssessment:ConfidenceAssessment; metrics:DecisionMetric[]; mainQuest:Mission|null; sideMissions:Mission[]; findings:DecisionFinding[]; options:DecisionOption[]; explanationRefs:SemanticRef[]; ruleIds:string[]; ruleRefs:VersionRef[]; evidenceIds:string[]; assumptionIds:string[]; assumptions:RevisionRef[]; missingInformation:SemanticRef[]; modelVersions:VersionRef[]; provenance:DecisionProvenance; evaluation:EvaluationMetadata }
