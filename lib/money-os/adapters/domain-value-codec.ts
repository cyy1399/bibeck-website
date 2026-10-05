import { readInput } from "../../money-model/runtime/input-value.ts";
import type { DomainValue } from "../../money-model/contracts/domain-value.schema.ts";
import { accepted, rejected, plainRecord, exactKeys, type CodecResult } from "../contracts/errors.ts";
import { SOURCE_CODEC_VERSION, SOURCE_ENVELOPE_VERSION, SOURCE_LIMITS, SOURCE_FIELDS, isCurrencyCode,
  type SourceFieldDto, type DomainFieldValue, type ValueCodecContract, type SourceEnvelope,
  type DomainSourceEnvelope, type SourceCollection, type SourceRecordDto, type SourceUnit } from "../contracts/source.ts";
import { canonicalDecimal, toDomainNumber, fromDomainNumber } from "./money-codec.ts";
import { calendarDate, parseBasis } from "./time-codec.ts";

const units: readonly SourceUnit[] = ["MONEY", "MONEY_PER_MONTH", "APR_PERCENT", "RATIO", "COUNT", "BOOLEAN", "DATE"];
const isMoney = (unit: SourceUnit): boolean => unit === "MONEY" || unit === "MONEY_PER_MONTH";
/** Explicit trusted applicability contracts; S02 installs NO financial N/A policy. */
export interface SourceCodecPolicy { supportedNotApplicableFields?: readonly string[] }

/** UTF-8 size without DOM/Node dependencies. Lone surrogates count as replacement characters. */
function utf8Bytes(input: string): number {
  let bytes = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    if (c <= 0x7f) bytes++;
    else if (c <= 0x7ff) bytes += 2;
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < input.length && input.charCodeAt(i + 1) >= 0xdc00 && input.charCodeAt(i + 1) <= 0xdfff) { bytes += 4; i++; }
    else bytes += 3;
    if (bytes > SOURCE_LIMITS.payloadBytes) return bytes;
  }
  return bytes;
}

/** Guard before serialization or reading any nested properties (including getters/toJSON). */
export function boundedJson(input: unknown): CodecResult<true> {
  let nodes = 0, bytes = 0;
  const ancestors = new Set<object>();
  const visit = (value: unknown, depth: number): string | undefined => {
    if (++nodes > SOURCE_LIMITS.nodes || depth > SOURCE_LIMITS.nestingDepth) return "PAYLOAD_STRUCTURE_LIMIT";
    if (typeof value === "string") { bytes += utf8Bytes(value); return bytes > SOURCE_LIMITS.payloadBytes ? "PAYLOAD_LIMIT" : undefined; }
    if (value === null || typeof value === "boolean" || typeof value === "number" && Number.isFinite(value)) return undefined;
    if (typeof value !== "object" || ancestors.has(value)) return "INVALID_JSON_STRUCTURE";
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype || Reflect.ownKeys(value).length !== value.length + 1) return "INVALID_JSON_STRUCTURE";
      if (value.length > SOURCE_LIMITS.collectionRecords) return "COLLECTION_RECORD_LIMIT";
      for (let i = 0; i < value.length; i++) if (!Object.hasOwn(value, i) || !Object.hasOwn(Object.getOwnPropertyDescriptor(value, String(i))!, "value")) return "INVALID_JSON_STRUCTURE";
    } else if (!plainRecord(value)) return "INVALID_JSON_STRUCTURE";
    ancestors.add(value);
    for (const [key, entry] of Object.entries(value)) {
      bytes += utf8Bytes(key);
      if (bytes > SOURCE_LIMITS.payloadBytes) return "PAYLOAD_LIMIT";
      const issue = visit(entry, depth + 1);
      if (issue) return issue;
    }
    ancestors.delete(value);
    return undefined;
  };
  try {
    const issue = visit(input, 0);
    if (issue) return rejected(issue);
    const serialized = JSON.stringify(input);
    return serialized !== undefined && utf8Bytes(serialized) <= SOURCE_LIMITS.payloadBytes ? accepted(true) : rejected("PAYLOAD_LIMIT");
  } catch { return rejected("INVALID_JSON_STRUCTURE"); }
}

const singleLine = (input: unknown, limit: number, nonempty = false): input is string =>
  typeof input === "string" && Array.from(input).length <= limit && (!nonempty || !!input.trim())
  && !/[\u0000-\u001f\u007f\u2028\u2029]/u.test(input);
function validContract(contract: unknown): contract is ValueCodecContract {
  return plainRecord(contract) && exactKeys(contract, ["unit"], ["primaryCurrency", "allowNotApplicable"])
    && units.includes(contract.unit as SourceUnit) && (!Object.hasOwn(contract, "primaryCurrency") || isCurrencyCode(contract.primaryCurrency))
    && (!Object.hasOwn(contract, "allowNotApplicable") || typeof contract.allowNotApplicable === "boolean");
}

export function parseSourceField(input: unknown, contract: ValueCodecContract): CodecResult<SourceFieldDto> {
  const guard = boundedJson(input);
  if (!guard.ok) return guard;
  if (!validContract(contract) || !plainRecord(input) || !exactKeys(input, ["unit", "value"], ["currency"])) return rejected("INVALID_FIELD_SHAPE");
  if (input.unit !== contract.unit) return rejected("UNIT_MISMATCH");
  if (isMoney(contract.unit) ? !isCurrencyCode(input.currency) : Object.hasOwn(input, "currency")) return rejected("INVALID_FIELD_CURRENCY");
  const tag = input.value;
  if (!plainRecord(tag)) return rejected("INVALID_INPUT_TAG");
  const metadata = { unit: contract.unit, ...(isMoney(contract.unit) ? { currency: input.currency as string } : {}) };
  if (tag.status === "UNKNOWN" || tag.status === "NOT_APPLICABLE") {
    if (!exactKeys(tag, ["status", "reasonCode"]) || !singleLine(tag.reasonCode, SOURCE_LIMITS.textCodePoints, true)) return rejected("INVALID_INPUT_TAG");
    if (tag.status === "NOT_APPLICABLE" && !contract.allowNotApplicable) return rejected("NOT_APPLICABLE_NOT_SUPPORTED");
    return accepted({ ...metadata, value: { status: tag.status, reasonCode: tag.reasonCode } });
  }
  if (tag.status !== "KNOWN" || !exactKeys(tag, ["status", "data"]) || !plainRecord(tag.data)
    || !exactKeys(tag.data, ["value", "source", "updatedAt"]) || tag.data.source !== "USER_REPORTED" || !calendarDate(tag.data.updatedAt).ok) return rejected("INVALID_INPUT_METADATA");
  let value: string | boolean;
  if (contract.unit === "BOOLEAN") {
    if (typeof tag.data.value !== "boolean") return rejected("INVALID_BOOLEAN");
    value = tag.data.value;
  } else if (contract.unit === "DATE") {
    const date = calendarDate(tag.data.value);
    if (!date.ok) return date;
    value = date.value;
  } else {
    const decimal = canonicalDecimal(tag.data.value);
    if (!decimal.ok) return decimal;
    if (contract.unit === "COUNT" && decimal.value.includes(".")) return rejected("INVALID_COUNT");
    value = decimal.value;
  }
  return accepted({ ...metadata, value: { status: "KNOWN", data: { value, source: "USER_REPORTED", updatedAt: tag.data.updatedAt as string } } });
}

export function toDomainField(input: unknown, contract: ValueCodecContract): CodecResult<DomainFieldValue> {
  const parsed = parseSourceField(input, contract);
  if (!parsed.ok) return parsed;
  if (isMoney(contract.unit)) {
    if (!isCurrencyCode(contract.primaryCurrency)) return rejected("PRIMARY_CURRENCY_REQUIRED");
    if (parsed.value.currency !== contract.primaryCurrency) return rejected("CURRENCY_MISMATCH");
  }
  const { value: tag, ...metadata } = parsed.value;
  if (tag.status !== "KNOWN") return accepted({ ...metadata, value: tag });
  let value: number | string | boolean = tag.data.value;
  if (!["BOOLEAN", "DATE"].includes(contract.unit)) {
    const number = toDomainNumber(value);
    if (!number.ok) return number;
    value = number.value;
  }
  return accepted({ ...metadata, value: { status: "KNOWN", data: { ...tag.data, value } } });
}

/** Input round-trip only: CALCULATED/VERIFIED output cannot be laundered into source DTOs. */
export function fromDomainField(input: unknown, contract: ValueCodecContract): CodecResult<SourceFieldDto> {
  const guard = boundedJson(input);
  if (!guard.ok) return guard;
  if (!validContract(contract) || !plainRecord(input) || !exactKeys(input, ["unit", "value"], ["currency"]) || !plainRecord(input.value)) return rejected("INVALID_DOMAIN_FIELD");
  const tag = input.value;
  const frozen = readInput(tag as unknown as DomainValue<number | string | boolean>);
  if (frozen !== tag) return rejected("INVALID_DOMAIN_FIELD");
  if (frozen.status !== "KNOWN") {
    const parsed = parseSourceField(input, contract);
    if (!parsed.ok) return parsed;
    const checked = toDomainField(parsed.value, contract);
    return checked.ok ? parsed : checked;
  }
  let value: string | boolean;
  if (contract.unit === "BOOLEAN") {
    if (typeof frozen.data.value !== "boolean") return rejected("INVALID_BOOLEAN");
    value = frozen.data.value;
  } else if (contract.unit === "DATE") {
    const date = calendarDate(frozen.data.value);
    if (!date.ok) return date;
    value = date.value;
  } else {
    const number = fromDomainNumber(frozen.data.value);
    if (!number.ok) return number;
    value = number.value;
  }
  const parsed = parseSourceField({ ...input, value: { ...frozen, data: { ...frozen.data, value } } }, contract);
  if (!parsed.ok) return parsed;
  // Check currency/unit on both directions, not only while reading requests.
  const checked = toDomainField(parsed.value, contract);
  return checked.ok ? parsed : checked;
}

function applicabilityPolicy(policy: SourceCodecPolicy): CodecResult<ReadonlySet<string>> {
  if (!plainRecord(policy) || !exactKeys(policy, [], ["supportedNotApplicableFields"])) return rejected("INVALID_CODEC_POLICY");
  const refs = policy.supportedNotApplicableFields ?? [];
  if (!Array.isArray(refs) || refs.length > 100) return rejected("INVALID_CODEC_POLICY");
  const supported = new Set<string>();
  for (const ref of refs) {
    if (typeof ref !== "string") return rejected("INVALID_CODEC_POLICY");
    const parts = ref.split(".");
    if (parts.length !== 2 || !Object.hasOwn(SOURCE_FIELDS, parts[0]) || !Object.hasOwn(SOURCE_FIELDS[parts[0] as SourceCollection], parts[1])) return rejected("INVALID_CODEC_POLICY");
    supported.add(ref);
  }
  return accepted(supported);
}

export function parseSourceEnvelope(input: unknown, policy: SourceCodecPolicy = {}): CodecResult<SourceEnvelope> {
  const guard = boundedJson(input);
  if (!guard.ok) return guard;
  const support = applicabilityPolicy(policy);
  if (!support.ok) return support;
  if (!plainRecord(input) || !exactKeys(input, ["profileEnvelopeVersion", "codecVersion", "basis", "collections"])) return rejected("INVALID_SOURCE_ENVELOPE");
  if (input.profileEnvelopeVersion !== SOURCE_ENVELOPE_VERSION || input.codecVersion !== SOURCE_CODEC_VERSION) return rejected("UNSUPPORTED_SOURCE_VERSION");
  const basis = parseBasis(input.basis);
  if (!basis.ok) return basis;
  if (!plainRecord(input.collections)) return rejected("INVALID_COLLECTIONS");
  const collections: SourceEnvelope["collections"] = {};
  for (const [collection, records] of Object.entries(input.collections)) {
    if (!Object.hasOwn(SOURCE_FIELDS, collection) || !Array.isArray(records)) return rejected("INVALID_COLLECTIONS");
    if (records.length > SOURCE_LIMITS.collectionRecords) return rejected("COLLECTION_RECORD_LIMIT");
    const names = SOURCE_FIELDS[collection as SourceCollection] as Record<string, SourceUnit>;
    const ids = new Set<string>(), parsedRecords: SourceRecordDto[] = [];
    for (const record of records) {
      if (!plainRecord(record) || !exactKeys(record, ["id", "values"], ["name", "note"]) || !singleLine(record.id, SOURCE_LIMITS.nameCodePoints, true) || !plainRecord(record.values)) return rejected("INVALID_SOURCE_RECORD");
      if (ids.has(record.id)) return rejected("DUPLICATE_RECORD_ID");
      ids.add(record.id);
      if (Object.hasOwn(record, "name") && !singleLine(record.name, SOURCE_LIMITS.nameCodePoints)) return rejected("NAME_LIMIT");
      if (Object.hasOwn(record, "note") && !singleLine(record.note, SOURCE_LIMITS.textCodePoints)) return rejected("TEXT_LIMIT");
      const fields: SourceRecordDto["values"] = {};
      for (const [key, raw] of Object.entries(record.values)) {
        if (!Object.hasOwn(names, key)) return rejected("UNREGISTERED_SOURCE_FIELD");
        const result = parseSourceField(raw, { unit: names[key], allowNotApplicable: support.value.has(collection + "." + key) });
        if (!result.ok) return { ok: false, error: { ...result.error, fieldRefs: [collection + "." + key] } };
        if (result.value.value.status === "KNOWN" && result.value.value.data.updatedAt > basis.value.asOf) return rejected("OBSERVATION_AFTER_AS_OF", collection + "." + key);
        fields[key] = result.value;
      }
      parsedRecords.push({ id: record.id, ...(Object.hasOwn(record, "name") ? { name: record.name as string } : {}),
        ...(Object.hasOwn(record, "note") ? { note: record.note as string } : {}), values: fields });
    }
    collections[collection as SourceCollection] = parsedRecords;
  }
  return accepted({ profileEnvelopeVersion: SOURCE_ENVELOPE_VERSION, codecVersion: SOURCE_CODEC_VERSION, basis: basis.value, collections });
}

export function parseSourceEnvelopeJson(input: unknown, policy: SourceCodecPolicy = {}): CodecResult<SourceEnvelope> {
  if (typeof input !== "string") return rejected("INVALID_JSON");
  if (utf8Bytes(input) > SOURCE_LIMITS.payloadBytes) return rejected("PAYLOAD_LIMIT");
  let decoded: unknown;
  try { decoded = JSON.parse(input); } catch { return rejected("INVALID_JSON"); }
  return parseSourceEnvelope(decoded, policy);
}
export function serializeSourceEnvelope(input: unknown, policy: SourceCodecPolicy = {}): CodecResult<string> {
  const parsed = parseSourceEnvelope(input, policy);
  return parsed.ok ? accepted(JSON.stringify(parsed.value)) : parsed;
}

/** Scalar bridge only: never builds FinancialProfile/resources/claims, evaluates or saves. */
export function toDomainEnvelope(input: unknown, policy: SourceCodecPolicy = {}): CodecResult<DomainSourceEnvelope> {
  const parsed = parseSourceEnvelope(input, policy);
  if (!parsed.ok) return parsed;
  const supported = applicabilityPolicy(policy);
  if (!supported.ok) return supported;
  const collections: DomainSourceEnvelope["collections"] = {};
  for (const [collection, records] of Object.entries(parsed.value.collections)) {
    collections[collection as SourceCollection] = [];
    for (const record of records!) {
      const fields: Record<string, DomainFieldValue> = {};
      for (const [key, field] of Object.entries(record.values)) {
        const result = toDomainField(field, { unit: field.unit, primaryCurrency: parsed.value.basis.primaryCurrency, allowNotApplicable: supported.value.has(collection + "." + key) });
        if (!result.ok) return { ok: false, error: { ...result.error, fieldRefs: [collection + "." + key] } };
        fields[key] = result.value;
      }
      collections[collection as SourceCollection]!.push({ ...record, values: fields });
    }
  }
  return accepted({ ...parsed.value, collections });
}

export function fromDomainEnvelope(input: unknown, policy: SourceCodecPolicy = {}): CodecResult<SourceEnvelope> {
  const guard = boundedJson(input);
  if (!guard.ok) return guard;
  const supported = applicabilityPolicy(policy);
  if (!supported.ok) return supported;
  if (!plainRecord(input) || !exactKeys(input, ["profileEnvelopeVersion", "codecVersion", "basis", "collections"]) || !plainRecord(input.collections)) return rejected("INVALID_DOMAIN_ENVELOPE");
  const basis = parseBasis(input.basis);
  if (!basis.ok) return basis;
  const collections: SourceEnvelope["collections"] = {};
  for (const [collection, records] of Object.entries(input.collections)) {
    if (!Object.hasOwn(SOURCE_FIELDS, collection) || !Array.isArray(records)) return rejected("INVALID_COLLECTIONS");
    const fields = SOURCE_FIELDS[collection as SourceCollection] as Record<string, SourceUnit>;
    collections[collection as SourceCollection] = [];
    for (const record of records) {
      if (!plainRecord(record) || !exactKeys(record, ["id", "values"], ["name", "note"]) || !plainRecord(record.values)) return rejected("INVALID_SOURCE_RECORD");
      const encoded: Record<string, SourceFieldDto> = {};
      for (const [key, field] of Object.entries(record.values)) {
        if (!Object.hasOwn(fields, key)) return rejected("UNREGISTERED_SOURCE_FIELD");
        const result = fromDomainField(field, { unit: fields[key], primaryCurrency: basis.value.primaryCurrency, allowNotApplicable: supported.value.has(collection + "." + key) });
        if (!result.ok) return { ok: false, error: { ...result.error, fieldRefs: [collection + "." + key] } };
        encoded[key] = result.value;
      }
      collections[collection as SourceCollection]!.push({ ...record, values: encoded } as SourceRecordDto);
    }
  }
  return parseSourceEnvelope({ ...input, collections }, policy);
}
