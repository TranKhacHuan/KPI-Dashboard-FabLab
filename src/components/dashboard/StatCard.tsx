import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: "primary" | "gold" | "success" | "warning";
}

const toneMap = {
  primary: "bg-gradient-primary text-primary-foreground",
  gold: "bg-gradient-gold text-primary",
  success: "bg-success text-white",
  warning: "bg-warning text-primary",
} as const;

export function StatCard({ label, value, icon: Icon, hint, tone = "primary" }: Props) {
  return (
    <Card className="relative overflow-hidden border-border bg-card p-5 shadow-soft transition-smooth hover:shadow-elegant">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-soft ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
