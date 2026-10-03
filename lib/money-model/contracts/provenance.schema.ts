import type { Confidence, DataSource } from "./common.ts";
import type { ValueRef } from "./predicate.schema.ts";
export interface VersionRef { id:string; version:string }
export interface RevisionRef { id:string; revision:number }
export interface DecisionProvenance { ruleRefs:VersionRef[]; modelRefs:VersionRef[]; metricRefs:ValueRef[]; inputRefs:ValueRef[]; sourceInputRefs:string[]; evidenceRefs:RevisionRef[]; assumptionRefs:RevisionRef[]; findingIds:string[] }
export interface ConfidenceAssessment { level:Confidence; reasonCodes:string[]; inputRefs:ValueRef[]; modelRefs:VersionRef[]; assumptionRefs:RevisionRef[] }
export interface InputState { status:"KNOWN"|"UNKNOWN"|"NOT_APPLICABLE"; value?:string|number|boolean|null; reasonCode?:string; source?:DataSource; updatedAt?:string }
export interface EvaluationMetadata { id:string; snapshotId:string; evaluatedAt:string; schemaVersion:"1.0.0"; jurisdiction:string; inputStates:Partial<Record<ValueRef,InputState>>; configValues:Partial<Record<ValueRef,number>>; source:"REFERENCE_CONTEXT"|"PROFILE_NORMALIZATION"; inputRecords?:Record<string,InputState>; valueLineage?:Partial<Record<ValueRef,string[]>>; valueDependencies?:Partial<Record<ValueRef,ValueRef[]>> }
