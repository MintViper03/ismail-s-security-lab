import { Shield, Zap } from "lucide-react";

type Props = {
  mode: "attack" | "defend";
  setMode: (m: "attack" | "defend") => void;
};

export function ModeToggle({ mode, setMode }: Props) {
  const isAttack = mode === "attack";
  return (
    <div
      role="group"
      aria-label="Mode toggle"
      className="relative inline-flex items-center rounded-full hair-border bg-surface p-1 font-mono-tech text-[11px] uppercase tracking-[0.14em]"
    >
      <span
        aria-hidden
        className="absolute top-1 bottom-1 w-1/2 rounded-full transition-all duration-300 ease-out"
        style={{
          left: isAttack ? "4px" : "calc(50% - 0px)",
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--accent) 22%, transparent), color-mix(in oklab, var(--accent) 10%, transparent))",
          boxShadow:
            "inset 0 0 0 1px color-mix(in oklab, var(--accent) 70%, transparent)",
        }}
      />
      <button
        type="button"
        onClick={() => setMode("attack")}
        aria-pressed={isAttack}
        className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
          isAttack ? "text-[color:var(--attack)]" : "text-muted"
        }`}
      >
        <Zap className="h-3 w-3" strokeWidth={2.5} />
        Attack
      </button>
      <button
        type="button"
        onClick={() => setMode("defend")}
        aria-pressed={!isAttack}
        className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
          !isAttack ? "text-[color:var(--defend)]" : "text-muted"
        }`}
      >
        <Shield className="h-3 w-3" strokeWidth={2.5} />
        Defend
      </button>
    </div>
  );
}
