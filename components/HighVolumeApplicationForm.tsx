"use client";

import type { FormEvent, ReactNode } from "react";
import { brandConfig, mailto } from "@/config/brand";

const inputClass = "calculator-input mt-2 w-full";

export function HighVolumeApplicationForm() {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lines = Array.from(data.entries()).map(([key, value]) => `${key}：${String(value)}`);
    window.location.href = mailto(brandConfig.publicEmails.support, "BiBeck 高交易量快速審核", `您好，我想申請高交易量快速審核。\n\n${lines.join("\n")}\n\n我了解初步核准不代表返傭已生效，仍需完成指定帳戶註冊、UID 歸戶及必要驗證。`);
  }

  return (
    <form onSubmit={submit} className="grid gap-8 border border-white/10 bg-[#121212] p-5 sm:p-8">
      <Fieldset title="基本資料">
        <Field label="姓名或稱呼" name="姓名或稱呼" required />
        <Field label="聯絡 Email" name="聯絡 Email" type="email" required />
        <Field label="LINE／Telegram" name="LINE／Telegram" required />
        <SelectField label="申請交易所" name="申請交易所" options={["Bybit", "Binance", "Bitget", "BingX", "OKX"]} />
        <Field label="目前交易所 UID" name="目前交易所 UID" required />
        <Field label="預計新返傭帳戶 UID（可留空）" name="預計新返傭帳戶 UID" />
        <SelectField label="身分類型" name="身分類型" options={["個人交易者", "專業交易者", "量化／API 交易者", "團隊或代理", "KOL／社群經營者"]} />
      </Fieldset>

      <Fieldset title="交易資訊">
        <Field label="最近 30 日交易量（USDT）" name="最近 30 日交易量" inputMode="decimal" required />
        <Field label="最近 90 日平均月交易量（USDT）" name="最近 90 日平均月交易量" inputMode="decimal" required />
        <Field label="預計未來每月交易量（USDT）" name="預計未來每月交易量" inputMode="decimal" />
        <SelectField label="主要交易商品" name="主要交易商品" options={["現貨", "USDT 永續", "反向合約", "選擇權", "多種商品"]} />
        <Field label="Maker／Taker 大致比例" name="Maker／Taker 比例" placeholder="例如 Maker 30%／Taker 70%" />
        <Field label="主要交易頻率" name="主要交易頻率" />
        <Field label="目前 VIP 等級" name="目前 VIP 等級" />
        <Field label="目前其他返傭方案" name="目前其他返傭方案" />
        <Field label="期望返傭比例" name="期望返傭比例" />
      </Fieldset>

      <div>
        <h2 className="text-xl font-semibold text-white">證明資料說明</h2>
        <p className="mt-3 text-sm leading-7 text-secondary">送出後會開啟 Email 草稿。請另行附上最近 30 日交易量、VIP 等級、手續費明細、API 匯出紀錄或近 90 日月度交易量等可驗證資料。最好讓 UID 與交易量同時可見。</p>
        <p className="mt-3 border-l-2 border-gold/60 pl-4 text-sm leading-7 text-secondary">請遮蔽姓名、資產餘額、Email、手機號碼等不必要資訊。BiBeck 不會要求密碼、驗證碼、API Secret、私鑰或助記詞。</p>
      </div>

      <label className="flex items-start gap-3 text-sm leading-7 text-secondary"><input type="checkbox" required className="mt-1.5 accent-[var(--gold)]" />我了解較高初始比例須人工審核，核准後為暫定級距，並會在首個完整交易月份後重新審核。</label>
      <button type="submit" className="cta-button button-primary w-full sm:w-fit">建立快速審核申請 Email</button>
    </form>
  );
}

function Fieldset({ title, children }: { title: string; children: ReactNode }) {
  return <fieldset><legend className="text-xl font-semibold text-white">{title}</legend><div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div></fieldset>;
}

function Field({ label, name, type = "text", required = false, inputMode, placeholder }: { label: string; name: string; type?: string; required?: boolean; inputMode?: "decimal"; placeholder?: string }) {
  return <label className="block min-w-0 text-sm font-medium text-white">{label}<input className={inputClass} name={name} type={type} required={required} inputMode={inputMode} placeholder={placeholder} /></label>;
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <label className="block min-w-0 text-sm font-medium text-white">{label}<select className={inputClass} name={name}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
