"use client";

import { useEffect, useMemo, useState, type DragEvent, type FormEvent, type ReactNode } from "react";
import { brandConfig } from "@/config/brand";
import { applicantTypes, applicationUploadPolicy, bybitVipOptions, highVolumeApplicationExchanges, productOptions, requestedRebateOptions } from "@/config/high-volume-application";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";
import Link from "next/link";

const inputClass = "calculator-input mt-2 w-full min-w-0";
const enabledExchanges = highVolumeApplicationExchanges.filter((exchange) => exchange.applicationEnabled);

type SubmitState = { status: "idle" | "sending" | "success" | "error"; message?: string; applicationId?: string };

export function HighVolumeApplicationForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [volume30d, setVolume30d] = useState(0);
  const [volume90dAverage, setVolume90dAverage] = useState(0);
  const [expectedMonthlyVolume, setExpectedMonthlyVolume] = useState(0);
  const [requestedRebate, setRequestedRebate] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  function addFiles(incoming: File[]) {
    setFileError("");
    const next = [...files, ...incoming];
    if (next.length > applicationUploadPolicy.maxFiles) return setFileError("最多只能上傳 5 個檔案。");
    if (incoming.some((file) => !(applicationUploadPolicy.acceptedMimeTypes as readonly string[]).includes(file.type))) return setFileError("此檔案格式不支援。");
    if (incoming.some((file) => file.size > applicationUploadPolicy.maxFileSizeBytes)) return setFileError("單一檔案不可超過 8 MB。");
    if (next.reduce((sum, file) => sum + file.size, 0) > applicationUploadPolicy.maxTotalSizeBytes) return setFileError("所有附件合計不可超過 20 MB。");
    setFiles(next);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (files.length === 0) { setFileError("請至少上傳 1 份交易量證明。"); return; }
    setSubmitState({ status: "sending" });
    const data = new FormData(event.currentTarget);
    data.set("volume30d", String(volume30d)); data.set("volume90dAverage", String(volume90dAverage));
    data.set("expectedMonthlyVolume", expectedMonthlyVolume > 0 ? String(expectedMonthlyVolume) : "");
    files.forEach((file) => data.append("attachments", file, file.name));
    try {
      const response = await fetch("/api/high-volume-application", { method: "POST", body: data, headers: { Accept: "application/json" } });
      const result = await response.json() as { applicationId?: string; error?: string };
      if (!response.ok || !result.applicationId) throw new Error(result.error || "申請未能送出，請稍後再試。");
      setSubmitState({ status: "success", applicationId: result.applicationId });
      setFiles([]);
    } catch (error) {
      setSubmitState({ status: "error", message: error instanceof Error ? error.message : "申請未能送出，請稍後再試。" });
    }
  }

  return (
    <form onSubmit={submit} className="grid min-w-0 gap-8 border border-white/10 bg-[#121212] p-5 sm:p-8">
      <input name="website" tabIndex={-1} autoComplete="off" className="absolute left-[-10000px] h-px w-px" aria-hidden="true" />
      <Fieldset title="基本資料">
        <Field label="姓名或稱呼" name="name" required />
        <Field label="聯絡 Email" name="email" type="email" required />
        <Field label="LINE／Telegram（選填）" name="contactHandle" />
        <SelectField label="申請交易所" name="exchangeId" required options={enabledExchanges.map((exchange) => ({ value: exchange.id, label: exchange.name }))} defaultValue="bybit" />
        <Field label="目前交易所 UID（選填）" name="currentUid" hint="若交易量證明能同時顯示 UID 與交易量，將有助於加快審核。" />
        <SelectField label="身分類型" name="applicantType" required placeholder="請選擇身分類型" options={applicantTypes.map((value) => ({ value, label: value }))} />
      </Fieldset>

      <Fieldset title="交易資訊">
        <NumberField label="最近 30 日交易量（USDT）" value={volume30d} onChange={setVolume30d} required />
        <NumberField label="最近 90 日平均月交易量（USDT）" value={volume90dAverage} onChange={setVolume90dAverage} required />
        <NumberField label="預計未來每月交易量（USDT，選填）" value={expectedMonthlyVolume} onChange={setExpectedMonthlyVolume} />
        <SelectField label="主要交易商品" name="product" required placeholder="請選擇主要交易商品" options={productOptions.map((value) => ({ value, label: value }))} />
        <Field label="Maker／Taker 大致比例（選填）" name="makerTakerRatio" placeholder="例如 Maker 30%／Taker 70%" />
        <Field label="主要交易頻率（選填）" name="frequency" />
        <SelectField label="目前 VIP 等級" name="vipLevel" required placeholder="請選擇目前 VIP 等級" options={bybitVipOptions} />
        <Field label="目前其他返傭方案（選填）" name="otherRebate" />
        <label className="block min-w-0 text-sm font-medium text-white">期望返傭比例<select className={inputClass} name="requestedRebate" required value={requestedRebate} onChange={(event) => setRequestedRebate(event.target.value)}><option value="" disabled>請選擇期望返傭比例</option>{requestedRebateOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><span className="mt-2 block text-xs leading-5 text-secondary">此選項僅代表申請期待，不代表最終核准比例。</span>{requestedRebate === "40-plus" && <span className="mt-2 block text-xs leading-5 text-gold">40% 或以上方案需依交易量、手續費貢獻、合作模式及審核結果個別協商。</span>}</label>
        <label className="block min-w-0 text-sm font-medium text-white sm:col-span-2">補充說明（選填）<textarea className={`${inputClass} min-h-32 resize-y`} name="notes" /></label>
      </Fieldset>

      <div>
        <h2 className="text-xl font-semibold text-white">證明資料說明</h2>
        <p className="mt-3 text-sm leading-7 text-secondary">請上傳可驗證近期交易量、VIP 等級或手續費紀錄的畫面。建議讓交易所名稱、UID 與交易量同時可見，並遮蔽資產餘額、姓名、Email、手機號碼等不必要資訊。</p>
        <p className="mt-3 border-l-2 border-gold/60 pl-4 text-sm leading-7 text-secondary">BiBeck 不會要求帳戶密碼、驗證碼、API Secret、私鑰或助記詞。附件不會建立公開永久網址。</p>
        <UploadArea files={files} dragging={dragging} error={fileError} onFiles={addFiles} onDragging={setDragging} onRemove={(index) => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} onClear={() => { setFiles([]); setFileError(""); }} />
      </div>

      <aside className="border border-gold/25 bg-gold/[0.04] p-5 text-sm leading-7 text-secondary" aria-labelledby="data-collection-title">
        <h2 id="data-collection-title" className="text-base font-semibold text-white">提交前的個人資料告知</h2>
        <p className="mt-3">蒐集目的為聯絡申請人、核對交易量證明、評估返傭方案與防止濫用；資料類型包含聯絡資料、交易所 UID、交易量、VIP 狀態、申請內容及附件。</p>
        <p className="mt-2">資料將透過網站與郵件服務處理。正式保存期限、私有附件儲存與到期刪除流程仍待營運者確認，因此請遮蔽非必要個資與資產餘額，只提供審核所需資料。</p>
        <p className="mt-2">你可透過 <a className="break-all text-gold underline" href={`mailto:${brandConfig.publicEmails.contact}`}>{brandConfig.publicEmails.contact}</a> 申請查詢、更正或刪除資料。詳情請閱讀 <Link className="text-gold underline" href="/privacy">隱私權政策</Link> 與 <Link className="text-gold underline" href="/personal-data-notice">個人資料蒐集告知</Link>。</p>
      </aside>

      <div className="grid gap-3">
        <Consent name="legalConsent">我已閱讀並同意《隱私權政策》與《個人資料蒐集告知》。</Consent>
        <Consent name="dataConsent">我確認提供的資料真實且可供 BiBeck 進行高交易量方案評估，並理解申請比例不代表最終核准比例。</Consent>
        <Consent name="privacyConfirmed">我已遮蔽不必要的個人及資產資訊，且未提供密碼、驗證碼、API Secret、私鑰或助記詞。</Consent>
      </div>
      <button type="submit" disabled={submitState.status === "sending"} className="cta-button button-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit">{submitState.status === "sending" ? "正在提交申請…" : "提交高交易量審核"}</button>
      {submitState.status === "success" && <div role="status" className="border border-emerald-500/40 bg-emerald-500/10 p-5 text-sm leading-7 text-emerald-200"><strong className="block text-base text-white">申請已成功送出</strong>BiBeck 將依你提交的交易紀錄、穩定度及合作條件進行審核。申請結果將寄送至你的聯絡 Email。<span className="mt-2 block font-mono text-white">申請編號：{submitState.applicationId}</span></div>}
      {submitState.status === "error" && <div role="alert" className="border border-red-500/40 bg-red-500/10 p-5 text-sm leading-7 text-red-200">{submitState.message || "申請未能送出，請稍後再試。"} 若問題持續發生，請聯絡 <a className="break-all underline" href={`mailto:${brandConfig.publicEmails.support}`}>{brandConfig.publicEmails.support}</a>。</div>}
    </form>
  );
}

function UploadArea({ files, dragging, error, onFiles, onDragging, onRemove, onClear }: { files: File[]; dragging: boolean; error: string; onFiles: (files: File[]) => void; onDragging: (value: boolean) => void; onRemove: (index: number) => void; onClear: () => void }) {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  function drop(event: DragEvent<HTMLLabelElement>) { event.preventDefault(); onDragging(false); onFiles(Array.from(event.dataTransfer.files)); }
  return <div className="mt-6 min-w-0"><h3 className="font-semibold text-white">上傳交易量證明</h3><label onDragOver={(event) => { event.preventDefault(); onDragging(true); }} onDragLeave={() => onDragging(false)} onDrop={drop} className={`mt-3 flex min-h-36 w-full cursor-pointer flex-col items-center justify-center border border-dashed px-4 text-center transition ${dragging ? "border-gold bg-gold/10" : "border-white/20 bg-black/20 hover:border-gold/60"}`}><span className="text-sm font-semibold text-white">點擊選擇或拖曳檔案至此</span><span className="mt-2 text-xs leading-5 text-secondary">JPG、JPEG、PNG、WEBP、PDF；最多 5 個；單檔 8 MB；合計 20 MB</span><input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(event) => { onFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} /></label>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-secondary"><span>已選擇 {files.length} / 5 個檔案　總大小：{formatBytes(totalSize)} / 20 MB</span>{files.length > 0 && <button type="button" className="text-gold underline" onClick={onClear}>清除全部</button>}</div>
    {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
    {files.length > 0 && <ul className="mt-4 grid min-w-0 gap-3">{files.map((file, index) => <FileItem key={`${file.name}-${file.size}-${index}`} file={file} onRemove={() => onRemove(index)} />)}</ul>}
  </div>;
}

function FileItem({ file, onRemove }: { file: File; onRemove: () => void }) {
  const previewUrl = useMemo(() => file.type.startsWith("image/") ? URL.createObjectURL(file) : "", [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  // Blob URLs are local previews and cannot be handled by the Next image optimizer.
  // eslint-disable-next-line @next/next/no-img-element
  return <li className="flex min-w-0 items-center gap-3 border border-white/10 bg-black/20 p-3">{previewUrl ? <img src={previewUrl} alt="交易證明縮圖" className="h-12 w-12 shrink-0 object-cover" /> : <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/10 text-xs text-gold">PDF</span>}<span className="min-w-0 flex-1"><span className="block truncate text-sm text-white" title={file.name}>{file.name}</span><span className="text-xs text-secondary">{formatBytes(file.size)}</span></span><button type="button" onClick={onRemove} className="shrink-0 text-xs text-secondary underline hover:text-white" aria-label={`移除 ${file.name}`}>移除</button></li>;
}

function formatBytes(bytes: number): string { return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`; }
function Fieldset({ title, children }: { title: string; children: ReactNode }) { return <fieldset><legend className="text-xl font-semibold text-white">{title}</legend><div className="mt-5 grid min-w-0 gap-5 sm:grid-cols-2">{children}</div></fieldset>; }
function Field({ label, name, type = "text", required = false, placeholder, hint }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string; hint?: string }) { return <label className="block min-w-0 text-sm font-medium text-white">{label}<input className={inputClass} name={name} type={type} required={required} placeholder={placeholder} />{hint && <span className="mt-2 block text-xs leading-5 text-secondary">{hint}</span>}</label>; }
function NumberField({ label, value, onChange, required = false }: { label: string; value: number; onChange: (value: number) => void; required?: boolean }) { return <label className="block min-w-0 text-sm font-medium text-white">{label}<FormattedNumberInput value={value} onChange={onChange} ariaLabel={label} placeholder={required ? "請輸入交易量" : "選填"} className={inputClass} /></label>; }
function SelectField({ label, name, options, required = false, placeholder, defaultValue }: { label: string; name: string; options: readonly { value: string; label: string }[]; required?: boolean; placeholder?: string; defaultValue?: string }) { return <label className="block min-w-0 text-sm font-medium text-white">{label}<select className={inputClass} name={name} required={required} defaultValue={defaultValue ?? ""}>{placeholder && <option value="" disabled>{placeholder}</option>}{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }
function Consent({ name, children }: { name: string; children: ReactNode }) { return <label className="flex items-start gap-3 text-sm leading-7 text-secondary"><input type="checkbox" name={name} value="true" required className="mt-1.5 shrink-0 accent-[var(--gold)]" />{children}</label>; }
