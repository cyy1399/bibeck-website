import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import * as money from "../lib/money-os/adapters/money-codec.ts";
import * as time from "../lib/money-os/adapters/time-codec.ts";
import * as values from "../lib/money-os/adapters/domain-value-codec.ts";
import { SOURCE_LIMITS, SOURCE_FIELDS } from "../lib/money-os/contracts/source.ts";
import { decimalSum } from "../lib/money-model/arithmetic/decimal-arithmetic.ts";
import { analyzeFinancialProfile, moneyModelV1Bundle } from "../lib/money-model/index.ts";
import { goldenCase } from "./money-os/fixtures/golden-cases.ts";

const ok=r=>{assert.equal(r.ok,true,r.ok?undefined:JSON.stringify(r.error));return r.value;};
const bad=(r,code)=>{assert.equal(r.ok,false);assert.equal(r.error.category,"VALIDATION_ERROR");if(code)assert.equal(r.error.safeCode,code);assert.equal(r.error.retryable,false);};
const field=(value="0.1",unit="MONEY",currency="TWD")=>({unit,...(unit.startsWith("MONEY")?{currency}:{}),value:{status:"KNOWN",data:{value,source:"USER_REPORTED",updatedAt:"2026-10-02"}}});
const basis=()=>({primaryCurrency:"TWD",financialCalendarZone:"Asia/Taipei",asOf:"2026-10-02",monthlyPeriodId:"2026-09",primaryCurrencyConfirmed:true,netMonthlyBasisConfirmed:true,stockAsOfConfirmed:true});
const envelope=()=>({profileEnvelopeVersion:"1.0.0",codecVersion:"1.0.0",basis:basis(),collections:{income:[{id:"salary",name:"Salary",values:{averageMonthlyNetIncome:field("30000","MONEY_PER_MONTH")}}]}});

test("S02 money: canonical coefficients/scale and unchanged S00 arithmetic",()=>{
  for(const [token,expected,coefficient,scale] of [["0","0",0n,0],[" 000.1000 ","0.1",1n,1],["0.2","0.2",2n,1],["0.001","0.001",1n,3],["0012.0300","12.03",1203n,2]]){
    const c=ok(money.canonicalDecimal(token));assert.equal(c,expected);
    assert.deepEqual(ok(money.decimalParts(c)),{coefficient,scale});assert.equal(ok(money.decimalFromParts({coefficient,scale})),expected);
    const n=ok(money.toDomainNumber(c));assert.equal(ok(money.fromDomainNumber(n)),expected);
  }
  assert.equal(decimalSum([ok(money.toDomainNumber("0.1")),ok(money.toDomainNumber("0.2"))]),0.3);
  assert.equal(decimalSum([1,-0.9]),0.1);
});
test("S02 precision: malformed tokens, locale/exponent/negative sources and loss rejection",()=>{
  for(const invalid of ["-1","-0","+1","1e3","1E-3","NaN","Infinity","1,000","1 000","1.000,25","１２",".1","1.","",null,1,false])bad(money.canonicalDecimal(invalid));
  bad(money.toDomainNumber("9007199254740993"),"NUMBER_PRECISION_LOSS");
  bad(money.toDomainNumber("0.123456789012345678"),"NUMBER_PRECISION_LOSS");
});
test("S02 numeric bounds: at/over 64 token chars, 48 integer digits and scale 18",()=>{
  assert.equal(ok(money.canonicalDecimal("0".repeat(45)+"."+"0".repeat(18))),"0");bad(money.canonicalDecimal("0".repeat(65)),"NUMERIC_TOKEN_LIMIT");
  assert.equal(ok(money.canonicalDecimal("9".repeat(48))),"9".repeat(48));bad(money.canonicalDecimal("9".repeat(49)),"INTEGER_DIGIT_LIMIT");
  const small="0."+"0".repeat(17)+"1";assert.equal(ok(money.canonicalDecimal(small)),small);assert.equal(ok(money.toDomainNumber(small)),1e-18);
  bad(money.canonicalDecimal("0."+"0".repeat(18)+"1"),"DECIMAL_SCALE_LIMIT");
});
test("S02 signed derived: negative results are distinct from nonnegative source literals",()=>{
  assert.equal(ok(money.canonicalDecimal("-000.100","DERIVED")),"-0.1");assert.equal(ok(money.fromDomainNumber(-0.1)),"-0.1");assert.equal(ok(money.fromDomainNumber(-0)),"0");
  for(const n of [NaN,Infinity,-Infinity])bad(money.fromDomainNumber(n));
  bad(values.toDomainField(field("-0.1"),{unit:"MONEY",primaryCurrency:"TWD"}));
});
test("S02 minor-unit contract: exact explicit scale, never implicit currency rounding",()=>{
  const c={currency:"TWD",unit:"MONEY",declaredScale:3};
  assert.equal(ok(money.toMinorUnits("0.001",c)),1n);assert.equal(ok(money.fromMinorUnits(1n,c)),"0.001");
  assert.equal(ok(money.toMinorUnits("12.3",c)),12300n);
  bad(money.toMinorUnits("0.001",{...c,declaredScale:2}),"MINOR_UNIT_PRECISION_LOSS");
  for(const declaredScale of [-1,1.5,19,NaN])bad(money.toMinorUnits("1",{...c,declaredScale}));
  bad(money.toMinorUnits("1",{...c,currency:""}));bad(money.fromMinorUnits(-1n,c));
});
test("S02 display: rounding is terminal and nonzero values never silently display zero",()=>{
  const d=ok(money.formatDecimalForDisplay("12.345",2));assert.equal(d.canonical,"12.345");assert.equal(d.text,"12.35");assert.equal(d.rounded,true);
  const tiny=ok(money.formatDecimalForDisplay("0.001",2));assert.equal(tiny.text,"0.001");assert.equal(tiny.fullPrecision,"0.001");assert.equal(tiny.roundedToZero,true);
  assert.equal(ok(money.toDomainNumber(d.canonical)),12.345);assert.equal(ok(money.formatDecimalForDisplay("-0.001",2)).text,"-0.001");
});
test("S02 calendar: real leap days/months, calendar-only, no normalized impossible dates",()=>{
  for(const d of ["2024-02-29","2000-02-29","2026-10-02","2028-10-02"])assert.equal(ok(time.calendarDate(d)),d);
  for(const d of ["2025-02-29","1900-02-29","2026-04-31","2026-13-01","2026-00-01","2026-10-00","0000-01-01","2026-10-02T00:00:00Z","10/02/2026",null])bad(time.calendarDate(d));
  assert.equal(ok(time.monthlyPeriod("2026-09")),"2026-09");for(const m of ["2026-00","2026-13","2026-9","0000-01"])bad(time.monthlyPeriod(m));
  for(const zone of ["Asia/Taipei","America/New_York"])assert.equal(ok(time.calendarZone(zone)),zone);
  for(const zone of ["Invalid/Zone","+08:00",""])bad(time.calendarZone(zone));
  assert.equal(ok(time.auditInstant("2026-10-02T05:06:07.000Z")),"2026-10-02T05:06:07.000Z");
  bad(time.auditInstant("2026-10-02T13:06:07+08:00"));bad(time.auditInstant("2026-02-30T05:06:07Z"));
});
test("S02 basis: explicit attestations, no auto-confirmed monthly normalization",()=>{
  assert.deepEqual(ok(time.parseBasis(basis())),basis());assert.equal(ok(time.parseBasis({...basis(),netMonthlyBasisConfirmed:false})).netMonthlyBasisConfirmed,false);
  for(const patch of [{primaryCurrencyConfirmed:undefined},{netMonthlyBasisConfirmed:"true"},{financialCalendarZone:""},{asOf:"2026-02-30"},{stockAsOfConfirmed:null},{ownerId:"fake"}])bad(time.parseBasis({...basis(),...patch}));
});
test("S02 tags: UNKNOWN/zero/false/N/A round-trip; N/A requires a trusted field contract",()=>{
  const c={unit:"MONEY",primaryCurrency:"TWD"},missing={unit:"MONEY",currency:"TWD",value:{status:"UNKNOWN",reasonCode:"NOT_REPORTED"}};
  assert.deepEqual(ok(values.toDomainField(missing,c)),missing);assert.equal(ok(values.toDomainField(field("0"),c)).value.data.value,0);
  const no={unit:"BOOLEAN",value:{status:"KNOWN",data:{value:false,source:"USER_REPORTED",updatedAt:"2026-10-02"}}};assert.equal(ok(values.toDomainField(no,{unit:"BOOLEAN"})).value.data.value,false);
  const na={...missing,value:{status:"NOT_APPLICABLE",reasonCode:"SUPPORTED_INAPPLICABILITY"}};bad(values.toDomainField(na,c),"NOT_APPLICABLE_NOT_SUPPORTED");
  const supported={...c,allowNotApplicable:true};assert.deepEqual(ok(values.fromDomainField(ok(values.toDomainField(na,supported)),supported)),na);
  for(const value of [null,{}, {status:"UNKNOWN",reasonCode:"NOT_REPORTED",data:null},{status:"UNKNOWN",reasonCode:"NOT_REPORTED",value:"0"},{status:"UNKNOWN",reasonCode:""}])bad(values.toDomainField({...missing,value},c));
});
test("S02 units/currency: preserve mixed source currency, reject primary domain mismatch, APR12 is12",()=>{
  const mixed=field("12","MONEY","USD");assert.equal(ok(values.parseSourceField(mixed,{unit:"MONEY"})).currency,"USD");
  bad(values.toDomainField(mixed,{unit:"MONEY",primaryCurrency:"TWD"}),"CURRENCY_MISMATCH");
  assert.equal(ok(values.toDomainField(field("12","APR_PERCENT"),{unit:"APR_PERCENT"})).value.data.value,12);
  assert.equal(ok(values.toDomainField(field("0.12","RATIO"),{unit:"RATIO"})).value.data.value,0.12);
  bad(values.toDomainField(field("12","APR_PERCENT"),{unit:"RATIO"}),"UNIT_MISMATCH");
  bad(values.parseSourceField({...field(),currency:undefined},{unit:"MONEY"}));
  bad(values.parseSourceField({...field("12","APR_PERCENT"),currency:"TWD"},{unit:"APR_PERCENT"}));
});
test("S02 reverse bridge: currency/metadata/type checks apply to every tag",()=>{
  const c={unit:"MONEY",primaryCurrency:"TWD",allowNotApplicable:true};
  for(const status of ["UNKNOWN","NOT_APPLICABLE"]){
    const missing={unit:"MONEY",currency:"USD",value:{status,reasonCode:"NOT_REPORTED"}};
    bad(values.fromDomainField(missing,c),"CURRENCY_MISMATCH");
    bad(values.toDomainField(missing,c),"CURRENCY_MISMATCH");
  }
  const d=ok(values.toDomainField(field(),c));
  for(const source of ["CALCULATED","VERIFIED","IMPORTED"])bad(values.fromDomainField({...d,value:{status:"KNOWN",data:{...d.value.data,source}}},c));
  for(const value of [NaN,Infinity,"0.1",null])bad(values.fromDomainField({...d,value:{status:"KNOWN",data:{...d.value.data,value}}},c));
  const invalid=structuredClone(d);invalid.value.data.updatedAt="2026-02-30";bad(values.fromDomainField(invalid,c));
});
test("S02 storage: lossless draft remains string; oversized number cannot enter domain",()=>{
  const e=envelope();e.collections.income[0].values.averageMonthlyNetIncome.value.data.value="9007199254740993";
  const stored=ok(values.serializeSourceEnvelope(e));assert.equal(ok(values.parseSourceEnvelopeJson(stored)).collections.income[0].values.averageMonthlyNetIncome.value.data.value,"9007199254740993");
  const failure=values.toDomainEnvelope(e);bad(failure,"NUMBER_PRECISION_LOSS");assert.equal(JSON.stringify(failure).includes("9007199254740993"),false);
  const detached=ok(values.parseSourceEnvelope(envelope()));const domain=ok(values.toDomainEnvelope(detached));domain.collections.income[0].values.averageMonthlyNetIncome.value.data.value=1;
  assert.equal(detached.collections.income[0].values.averageMonthlyNetIncome.value.data.value,"30000");
});
test("S02 applicability: no installed N/A policy or body-controlled applicability",()=>{
  const e=envelope();e.collections.household=[{id:"household",values:{externalSupportAvailable:{unit:"BOOLEAN",value:{status:"NOT_APPLICABLE",reasonCode:"SUPPORTED_INAPPLICABILITY"}}}}];
  bad(values.parseSourceEnvelope(e),"NOT_APPLICABLE_NOT_SUPPORTED");
  const p={supportedNotApplicableFields:["household.externalSupportAvailable"]};
  const canonical=ok(values.parseSourceEnvelopeJson(ok(values.serializeSourceEnvelope(e,p)),p));assert.deepEqual(ok(values.fromDomainEnvelope(ok(values.toDomainEnvelope(canonical,p)),p)),canonical);
  bad(values.parseSourceEnvelope({...e,allowNotApplicable:true},p));bad(values.parseSourceEnvelope(e,{supportedNotApplicableFields:["household.fake"]}),"INVALID_CODEC_POLICY");
});
test("S02 metadata/security: no trusted sources/owner/output/flags or future observations",()=>{
  const f=field();for(const source of ["CALCULATED","VERIFIED","IMPORTED"])bad(values.parseSourceField({...f,value:{status:"KNOWN",data:{...f.value.data,source}}},{unit:"MONEY"}));
  for(const added of [{ownerId:"fake"},{DecisionOutput:{}},{flags:{}},{complete:true},{config:{}},{verified:true}])bad(values.parseSourceEnvelope({...envelope(),...added}));
  const future=envelope();future.collections.income[0].values.averageMonthlyNetIncome.value.data.updatedAt="2026-10-03";bad(values.parseSourceEnvelope(future),"OBSERVATION_AFTER_AS_OF");
});
test("S02 acceptance: DTO→storage JSON→domain→DTO preserves tags, basis, versions and omission",()=>{
  const e=envelope();e.collections.assets=[{id:"cash",values:{currentValue:field("000.1000"),availableEconomicValue:{unit:"MONEY",currency:"TWD",value:{status:"UNKNOWN",reasonCode:"NOT_REPORTED"}}}}];
  const parsed=ok(values.parseSourceEnvelopeJson(ok(values.serializeSourceEnvelope(e))));assert.equal(parsed.collections.assets[0].values.currentValue.value.data.value,"0.1");
  const restored=ok(values.fromDomainEnvelope(ok(values.toDomainEnvelope(parsed))));assert.deepEqual(restored,parsed);assert.deepEqual(JSON.parse(JSON.stringify(restored)),parsed);
  assert.equal(Object.hasOwn(restored.collections,"liabilities"),false);assert.equal(Object.hasOwn(restored.collections.assets[0].values,"missing"),false);
  const patch=structuredClone(parsed);patch.collections.assets[0].values.currentValue.value={status:"UNKNOWN",reasonCode:"NOT_REPORTED"};assert.equal(ok(values.toDomainEnvelope(patch)).collections.assets[0].values.currentValue.value.status,"UNKNOWN");
  assert.equal(JSON.stringify(restored).includes("coefficient"),false);bad(values.parseSourceEnvelope({...e,profileEnvelopeVersion:"2.0.0"}),"UNSUPPORTED_SOURCE_VERSION");
});
test("S02 bounds:100 records,120 Unicode name codepoints,500 text, no truncation",()=>{
  const e=envelope();e.collections.income=Array.from({length:100},(_,i)=>({id:"id"+i,name:"😀".repeat(120),note:"字".repeat(500),values:{}}));assert.equal(ok(values.parseSourceEnvelope(e)).collections.income.length,100);
  e.collections.income.push({id:"extra",values:{}});bad(values.parseSourceEnvelope(e),"COLLECTION_RECORD_LIMIT");e.collections.income.pop();
  e.collections.income[0].name="😀".repeat(121);bad(values.parseSourceEnvelope(e),"NAME_LIMIT");e.collections.income[0].name="ok";
  e.collections.income[0].note="字".repeat(501);bad(values.parseSourceEnvelope(e),"TEXT_LIMIT");
  e.collections.income[0].note="line\nbreak";bad(values.parseSourceEnvelope(e));e.collections.income[0].note="ok";
  e.collections.income[1].id=e.collections.income[0].id;bad(values.parseSourceEnvelope(e),"DUPLICATE_RECORD_ID");
});
test("S02 payload:256KiB exact UTF8 boundary before JSON decode",()=>{
  const raw=JSON.stringify(envelope());assert.equal(ok(values.parseSourceEnvelopeJson(raw+" ".repeat(SOURCE_LIMITS.payloadBytes-Buffer.byteLength(raw)))).profileEnvelopeVersion,"1.0.0");
  bad(values.parseSourceEnvelopeJson(raw+" ".repeat(SOURCE_LIMITS.payloadBytes-Buffer.byteLength(raw)+1)),"PAYLOAD_LIMIT");
  bad(values.parseSourceEnvelopeJson('"'+ "😀".repeat(65536)+'"'),"PAYLOAD_LIMIT");bad(values.parseSourceEnvelopeJson("{"),"INVALID_JSON");
});
test("S02 payload: cyclic/getter/sparse/symbol/prototype/depth attacks are rejected without effects",()=>{
  const cyclic=envelope();cyclic.collections.income[0].values.self=cyclic;bad(values.parseSourceEnvelope(cyclic));
  let calls=0;const getter=envelope();Object.defineProperty(getter,"owner",{enumerable:true,get(){calls++;return"fake";}});bad(values.parseSourceEnvelope(getter));assert.equal(calls,0);
  const sparse=envelope();sparse.collections.income=new Array(2);bad(values.parseSourceEnvelope(sparse));
  const symbol=envelope();symbol[Symbol("hidden")]=1;bad(values.parseSourceEnvelope(symbol));bad(values.parseSourceEnvelope(new Date()));
  const deep=envelope();let o=deep;for(let i=0;i<20;i++){o.x={};o=o.x;}bad(values.parseSourceEnvelope(deep));
});
test("S02 portability: device timezone never changes calendar/basis/source dates",()=>{
  const previous=process.env.TZ;try{for(const tz of ["Pacific/Honolulu","UTC","Asia/Taipei","Pacific/Kiritimati"]){process.env.TZ=tz;const e=envelope();e.collections.goals=[{id:"goal",values:{targetDate:field("2028-10-02","DATE")}}];assert.deepEqual(ok(values.fromDomainEnvelope(ok(values.toDomainEnvelope(ok(values.parseSourceEnvelope(e)))))),e);}}
  finally{if(previous===undefined)delete process.env.TZ;else process.env.TZ=previous;}
});
test("S02 S01 integration: all A–F decisions remain unchanged through scalar codecs",()=>{
  for(const id of ["A","B","C","D","E","F"]){
    const f=goldenCase(id),before=analyzeFinancialProfile(f.profile,f.options,moneyModelV1Bundle);
    const convert=(object,key,unit="MONEY")=>{const v=object[key];if(!v)return;const tag="status" in v?v:{status:"KNOWN",data:v};
      const dto={unit,...(unit.startsWith("MONEY")?{currency:"TWD"}:{}),value:tag.status==="KNOWN"?{...tag,data:{...tag.data,value:ok(money.fromDomainNumber(tag.data.value))}}:tag};
      object[key]=ok(values.toDomainField(dto,{unit,primaryCurrency:"TWD"})).value;};
    for(const i of f.profile.income)convert(i,"averageMonthlyNetIncome","MONEY_PER_MONTH");
    for(const k of ["necessaryMonthly","discretionaryMonthly","otherMonthlyRequired"])convert(f.profile.expenses,k,"MONEY_PER_MONTH");
    for(const a of f.profile.assets)convert(a,"currentValue");
    for(const d of f.profile.liabilities){convert(d,"balance");convert(d,"minimumMonthlyPayment","MONEY_PER_MONTH");convert(d,"apr","APR_PERCENT");}
    assert.deepEqual(analyzeFinancialProfile(f.profile,f.options,moneyModelV1Bundle),before,id);
  }
});
test("S02 foundation scope/import guards remain intact alongside explicitly authorized S04",()=>{
  const root=fileURLToPath(new URL("../lib/money-os/",import.meta.url));const list=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(path.join(dir,e.name)):[path.join(dir,e.name)]);
  const foundation=["adapters/claim-producer.ts","adapters/domain-value-codec.ts","adapters/money-codec.ts","adapters/producer-catalog.ts","adapters/profile-adapter.ts","adapters/resource-producer.ts","adapters/time-codec.ts","contracts/errors.ts","contracts/producer-manifest.ts","contracts/source.ts"];
  const files=list(root).filter(f=>foundation.includes(path.relative(root,f).replaceAll("\\","/")));
  assert.deepEqual(files.map(f=>path.relative(root,f).replaceAll("\\","/")).sort(),foundation);
  assert.ok(Object.isFrozen(SOURCE_FIELDS));for(const fields of Object.values(SOURCE_FIELDS))assert.ok(Object.isFrozen(fields));
  for(const f of files){const ast=ts.createSourceFile(f,readFileSync(f,"utf8"),ts.ScriptTarget.ES2022,true);
    const visit=n=>{if(ts.isImportDeclaration(n)){assert.ok(n.moduleSpecifier.text.startsWith("."));assert.ok(!/docs|server|presentation|application/.test(n.moduleSpecifier.text));}
      if(ts.isCallExpression(n))assert.notEqual(n.expression.kind,ts.SyntaxKind.ImportKeyword);
      if(ts.isIdentifier(n))assert.ok(!["parseFloat","window","document","fetch","process","console","require","eval"].includes(n.text),f+":"+n.text);ts.forEachChild(n,visit);};visit(ast);}
  const cfg=JSON.parse(readFileSync(new URL("../tsconfig.money-os.json",import.meta.url),"utf8"));assert.equal(cfg.compilerOptions.target,"ES2022");assert.deepEqual(cfg.compilerOptions.types,["node"]);assert.deepEqual(cfg.compilerOptions.lib,["ES2022","ES2022.Intl"]);
  assert.ok(cfg.include.includes("lib/money-os/**/*.ts"));assert.ok(cfg.include.includes("messages/money-os/**/*.ts"));
  const foundationCfg=JSON.parse(readFileSync(new URL("../tsconfig.money-os-foundation.json",import.meta.url),"utf8"));
  assert.equal(foundationCfg.extends,"./tsconfig.money-os.json");assert.deepEqual(foundationCfg.compilerOptions.types,[]);
  assert.ok(foundationCfg.include.includes("lib/money-os/adapters/**/*.ts"));assert.ok(!foundationCfg.include.includes("lib/money-os/application/**/*.ts"));
});
