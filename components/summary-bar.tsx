"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string
  value: string
  hint?: string
  tone?: "default" | "good" | "bad"
}) {
  return (
    <Card className="gap-1 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "font-mono text-2xl font-bold tabular-nums",
          tone === "good" && "text-chart-3",
          tone === "bad" && "text-destructive",
        )}
      >
        {value}
      </p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  )
}

export function SummaryBar({
  craftsDone,
  craftsTotal,
  shortfalls,
  caviaPct,
  trackedResources,
}: {
  craftsDone: number
  craftsTotal: number
  shortfalls: number
  caviaPct: number
  trackedResources: number
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat
        label="Crafts Queued"
        value={`${craftsDone}/${craftsTotal}`}
        hint="Daily crafting checklist"
      />
      <Stat
        label="Resource Shortfalls"
        value={String(shortfalls)}
        hint={shortfalls > 0 ? "Farm rate too low" : "Daily farm covers it"}
        tone={shortfalls > 0 ? "bad" : "good"}
      />
      <Stat
        label="Cavia Standing"
        value={`${caviaPct}%`}
        hint="Toward weekly shard"
        tone={caviaPct >= 100 ? "good" : "default"}
      />
      <Stat
        label="Tracked Resources"
        value={String(trackedResources)}
        hint="Across daily crafts"
      />
    </div>
  )
}
