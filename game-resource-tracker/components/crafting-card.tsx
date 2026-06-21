"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import type { Craft } from "@/lib/warframe-data"
import { cn, formatNum } from "@/lib/utils"
import { Hammer, Pencil, Plus, Trash2, X } from "lucide-react"

type CostRow = { resource: string; amount: string }

function CraftFormDialog({
  trigger,
  initial,
  resourceNames,
  onSubmit,
}: {
  trigger: React.ReactElement
  initial?: Craft
  resourceNames: string[]
  onSubmit: (craft: Omit<Craft, "id">) => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [qty, setQty] = useState("")
  const [note, setNote] = useState("")
  const [costs, setCosts] = useState<CostRow[]>([{ resource: "", amount: "" }])

  function hydrate() {
    if (initial) {
      setName(initial.name)
      setQty(initial.qty)
      setNote(initial.note ?? "")
      const rows = Object.entries(initial.resources).map(([resource, amount]) => ({
        resource,
        amount: String(amount),
      }))
      setCosts(rows.length > 0 ? rows : [{ resource: "", amount: "" }])
    } else {
      setName("")
      setQty("")
      setNote("")
      setCosts([{ resource: "", amount: "" }])
    }
  }

  function submit() {
    if (!name.trim()) return
    const resources: Record<string, number> = {}
    for (const row of costs) {
      const r = row.resource.trim()
      const a = Number(row.amount)
      if (r && a > 0) resources[r] = a
    }
    onSubmit({
      name: name.trim(),
      qty: qty.trim() || "×1",
      note: note.trim() || undefined,
      resources,
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
          <DialogTitle>{isEdit ? "Edit craft" : "Add a craft"}</DialogTitle>
          <DialogDescription>
            Name the item and assign the resources it consumes per day.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[1fr_6rem] gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="craft-name">Name</Label>
              <Input
                id="craft-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vapor Specter"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="craft-qty">Quantity</Label>
              <Input
                id="craft-qty"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="×10"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="craft-note">Note (optional)</Label>
            <Input
              id="craft-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="2× batches of 10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Resource costs</Label>
            {costs.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  list="craft-resource-names"
                  value={row.resource}
                  onChange={(e) =>
                    setCosts((c) =>
                      c.map((x, j) =>
                        j === i ? { ...x, resource: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="Resource"
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={0}
                  value={row.amount}
                  onChange={(e) =>
                    setCosts((c) =>
                      c.map((x, j) =>
                        j === i ? { ...x, amount: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="Amount"
                  className="w-28 text-right font-mono tabular-nums"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="shrink-0 text-muted-foreground"
                  onClick={() =>
                    setCosts((c) =>
                      c.length > 1 ? c.filter((_, j) => j !== i) : c,
                    )
                  }
                  aria-label="Remove cost row"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            <datalist id="craft-resource-names">
              {resourceNames.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="self-start gap-1.5 text-primary"
              onClick={() => setCosts((c) => [...c, { resource: "", amount: "" }])}
            >
              <Plus className="size-4" />
              Add resource cost
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!name.trim()}>
            {isEdit ? "Save changes" : "Add craft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CraftingCard({
  crafts,
  checked,
  onToggle,
  onAdd,
  onUpdate,
  onRemove,
  resourceNames,
}: {
  crafts: Craft[]
  checked: Record<string, boolean>
  onToggle: (id: string) => void
  onAdd: (craft: Omit<Craft, "id">) => void
  onUpdate: (id: string, craft: Omit<Craft, "id">) => void
  onRemove: (id: string) => void
  resourceNames: string[]
}) {
  const done = crafts.filter((c) => checked[c.id]).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <Hammer className="size-5 text-primary" />
          Daily Crafting
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="tabular-nums">
            {done}/{crafts.length} queued
          </Badge>
          <CraftFormDialog
            resourceNames={resourceNames}
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
        {crafts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No crafts yet. Use Add to queue one.
          </p>
        ) : null}
        {crafts.map((craft) => {
          const isChecked = !!checked[craft.id]
          return (
            <div
              key={craft.id}
              className={cn(
                "group rounded-xl border border-border bg-secondary/40 p-4 transition-colors",
                isChecked
                  ? "border-primary/50 bg-primary/5"
                  : "hover:border-primary/30",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => onToggle(craft.id)}
                    aria-label={`Mark ${craft.name} crafted`}
                  />
                  <span
                    className={cn(
                      "font-semibold",
                      isChecked && "text-muted-foreground line-through",
                    )}
                  >
                    {craft.name} <span className="text-primary">{craft.qty}</span>
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  {craft.note ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      {craft.note}
                    </Badge>
                  ) : null}
                  <CraftFormDialog
                    initial={craft}
                    resourceNames={resourceNames}
                    onSubmit={(c) => onUpdate(craft.id, c)}
                    trigger={
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                        aria-label={`Edit ${craft.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    onClick={() => onRemove(craft.id)}
                    aria-label={`Remove ${craft.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {Object.keys(craft.resources).length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(craft.resources).map(([resource, amount]) => (
                    <span
                      key={resource}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-background/60 px-2.5 py-1 text-sm text-muted-foreground"
                    >
                      {resource}
                      <span className="font-mono font-semibold text-foreground tabular-nums">
                        {formatNum(amount)}
                      </span>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
