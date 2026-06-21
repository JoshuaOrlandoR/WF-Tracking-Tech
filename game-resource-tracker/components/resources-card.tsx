"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Craft, ResourceDef } from "@/lib/warframe-data"
import { cn, formatNum } from "@/lib/utils"
import { Boxes, Pencil, Plus, Trash2 } from "lucide-react"

function ResourceFormDialog({
  trigger,
  initial,
  onSubmit,
}: {
  trigger: React.ReactElement
  initial?: ResourceDef
  onSubmit: (resource: ResourceDef) => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [dailyNeed, setDailyNeed] = useState("")
  const [sources, setSources] = useState("")

  function hydrate() {
    setName(initial?.name ?? "")
    setDailyNeed(initial ? String(initial.dailyNeed) : "")
    setSources(initial?.sources.join(", ") ?? "")
  }

  function submit() {
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      dailyNeed: Number(dailyNeed) || 0,
      sources: sources
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    })
    setOpen(false)
  }

  const isEdit = !!initial

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) hydrate()
        setOpen(o)
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit resource" : "Add a resource"}</DialogTitle>
          <DialogDescription>
            Track a resource with its own daily need and farm locations.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="res-name">Name</Label>
            <Input
              id="res-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Orokin Cell"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="res-need">Daily need</Label>
            <Input
              id="res-need"
              type="number"
              min={0}
              value={dailyNeed}
              onChange={(e) => setDailyNeed(e.target.value)}
              placeholder="0"
              className="font-mono tabular-nums"
            />
            <p className="text-xs text-muted-foreground">
              Extra demand on top of what crafts consume.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="res-sources">Farm locations</Label>
            <Input
              id="res-sources"
              value={sources}
              onChange={(e) => setSources(e.target.value)}
              placeholder="Saturn, Ceres, Deimos"
            />
            <p className="text-xs text-muted-foreground">
              Separate planets with commas.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!name.trim()}>
            {isEdit ? "Save changes" : "Add resource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ResourcesCard({
  crafts,
  resources,
  inventory,
  onInventoryChange,
  onAdd,
  onUpdate,
  onRemove,
}: {
  crafts: Craft[]
  resources: ResourceDef[]
  inventory: Record<string, number>
  onInventoryChange: (resource: string, value: number) => void
  onAdd: (resource: ResourceDef) => void
  onUpdate: (originalName: string, resource: ResourceDef) => void
  onRemove: (name: string) => void
}) {
  // Need per resource = what crafts consume + any extra manual daily need.
  const craftTotals: Record<string, number> = {}
  for (const craft of crafts) {
    for (const [resource, amount] of Object.entries(craft.resources)) {
      craftTotals[resource] = (craftTotals[resource] ?? 0) + amount
    }
  }

  const defByName = new Map(resources.map((r) => [r.name, r]))
  const allNames = Array.from(
    new Set([...resources.map((r) => r.name), ...Object.keys(craftTotals)]),
  )

  const rows = allNames
    .map((resource) => {
      const def = defByName.get(resource)
      const need = (craftTotals[resource] ?? 0) + (def?.dailyNeed ?? 0)
      return {
        resource,
        need,
        def,
        sources: def?.sources ?? [],
        // Only resources that exist as a manual def are editable/removable.
        editable: !!def,
      }
    })
    .sort((a, b) => b.need - a.need)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <Boxes className="size-5 text-primary" />
          Resource Pressure
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Need vs. daily farm</Badge>
          <ResourceFormDialog
            onSubmit={onAdd}
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="size-4" />
                Add
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No resources tracked yet.
          </p>
        ) : null}
        {rows.map(({ resource, need, def, sources: srcs, editable }) => {
          const dailyFarm = Number(inventory[resource] || 0)
          const net = dailyFarm - need
          const ok = net >= 0
          return (
            <div
              key={resource}
              className="group rounded-xl border border-border bg-secondary/40 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-semibold">{resource}</p>
                    {editable && def ? (
                      <>
                        <ResourceFormDialog
                          initial={def}
                          onSubmit={(r) => onUpdate(def.name, r)}
                          trigger={
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7 text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                              aria-label={`Edit ${resource}`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          }
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                          onClick={() => onRemove(resource)}
                          aria-label={`Remove ${resource}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Daily need{" "}
                    <span className="font-mono font-semibold text-foreground tabular-nums">
                      {formatNum(need)}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <label className="text-xs uppercase tracking-wide text-muted-foreground">
                      Daily Farm
                    </label>
                    <Input
                      type="number"
                      min={0}
                      step={100}
                      value={inventory[resource] ?? 0}
                      onChange={(e) =>
                        onInventoryChange(resource, Number(e.target.value || 0))
                      }
                      className="h-9 w-28 text-right font-mono tabular-nums"
                      aria-label={`${resource} daily farm`}
                    />
                  </div>
                  <div className="flex w-24 flex-col items-end">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      Net Daily
                    </span>
                    <span
                      className={cn(
                        "font-mono text-lg font-bold tabular-nums",
                        ok ? "text-chart-3" : "text-destructive",
                      )}
                    >
                      {ok ? "+" : ""}
                      {formatNum(net)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Farm
                </span>
                {(srcs.length > 0 ? srcs : ["TBD"]).map((planet) => (
                  <Badge
                    key={planet}
                    variant="outline"
                    className="border-primary/30 text-foreground"
                  >
                    {planet}
                  </Badge>
                ))}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
