"use client"

import { Button } from "@/components/ui/button"
import { Download, RotateCcw, Trash2 } from "lucide-react"

export function TrackerHeader({
  onResetDaily,
  onExport,
  onResetAll,
}: {
  onResetDaily: () => void
  onExport: () => void
  onResetAll: () => void
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Tenno Logistics
        </p>
        <h1 className="mt-1 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Warframe Operations
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-muted-foreground leading-relaxed">
          Daily crafting, resource pressure vs. daily farm, farm routing, Cavia
          standing, 1999 calendar progress, and a Helminth watchlist. Saved
          locally in this browser.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onResetDaily}>
          <RotateCcw className="size-4" />
          Reset Daily
        </Button>
        <Button variant="outline" onClick={onExport}>
          <Download className="size-4" />
          Export
        </Button>
        <Button
          variant="outline"
          onClick={onResetAll}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
          Reset All
        </Button>
      </div>
    </header>
  )
}
