"use client";

import { useEffect, useRef, useState } from "react";

const metrics = [
  { value: 6, suffix: "", label: "Core principles" },
  { value: 100, suffix: "%", label: "Rule-based process" },
  { value: 24, suffix: "/7", label: "System mindset" },
];

export function AnimatedNumbers() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid gap-px overflow-hidden border border-gold/18 bg-gold/18 md:grid-cols-3">
      {metrics.map((metric, index) => (
        <Counter key={metric.label} active={active} delay={index * 90} {...metric} />
      ))}
    </div>
  );
}

function Counter({
  active,
  delay,
  value,
  suffix,
  label,
}: {
  active: boolean;
  delay: number;
  value: number;
  suffix: string;
  label: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const total = 52;
    const timeout = window.setTimeout(() => {
      const tick = () => {
        frame += 1;
        const progress = 1 - Math.pow(1 - frame / total, 3);
        setCount(Math.round(value * progress));
        if (frame < total) window.requestAnimationFrame(tick);
      };
      tick();
    }, delay);
    return () => window.clearTimeout(timeout);
  }, [active, delay, value]);

  return (
    <div className="metal-panel px-6 py-7">
      <div className="font-mono text-4xl text-gold md:text-5xl">
        {count}
        {suffix}
      </div>
      <div className="mt-2 text-xs uppercase tracking-[0.24em] text-white/50">{label}</div>
    </div>
  );
}
