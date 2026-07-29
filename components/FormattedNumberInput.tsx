"use client";

import { useState } from "react";
import { formatNumberInput, parseNumberInput } from "@/lib/number-input";

export function FormattedNumberInput({ value, onChange, ariaLabel, placeholder, className = "calculator-input mt-2 w-full" }: { value: number; onChange: (value: number) => void; ariaLabel: string; placeholder?: string; className?: string }) {
  const [displayValue, setDisplayValue] = useState(() => formatNumberInput(value));

  function handleChange(rawValue: string) {
    const formatted = formatNumberInput(rawValue);
    setDisplayValue(formatted);
    onChange(parseNumberInput(formatted));
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={displayValue}
      onChange={(event) => handleChange(event.target.value)}
      className={className}
      autoComplete="off"
    />
  );
}
