"use client";

import { useState } from "react";
import { formatNumberInput, isValidNumberInput, parseNumberInput } from "@/lib/number-input";

export function FormattedNumberInput({ value, onChange, ariaLabel, placeholder, className = "calculator-input mt-2 w-full" }: { value: number; onChange: (value: number) => void; ariaLabel: string; placeholder?: string; className?: string }) {
  const [displayValue, setDisplayValue] = useState(() => formatNumberInput(value));
  const [invalid, setInvalid] = useState(false);

  function handleChange(rawValue: string) {
    const valid = isValidNumberInput(rawValue);
    setInvalid(!valid);
    if (!valid) {
      setDisplayValue(rawValue);
      return;
    }
    const formatted = formatNumberInput(rawValue);
    setDisplayValue(formatted);
    onChange(parseNumberInput(formatted));
  }

  return <>
    <input
      type="text"
      inputMode="decimal"
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={displayValue}
      aria-invalid={invalid}
      aria-describedby={invalid ? `${ariaLabel}-error` : undefined}
      onChange={(event) => handleChange(event.target.value)}
      className={className}
      autoComplete="off"
    />
    {invalid ? <span id={`${ariaLabel}-error`} role="alert" className="mt-2 block text-xs text-red-300">請輸入有效的最近 30 日交易量。</span> : null}
  </>;
}
