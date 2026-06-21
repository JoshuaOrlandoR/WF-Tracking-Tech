"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import type { FarmSpot } from "@/lib/warframe-data"
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react"

function FarmFormDialog({
  trigger,
  initial,
  onSubmit,
}: {
  trigger: React.ReactElement
  initial?: FarmSpot
  onSubmit: (spot: Omit<FarmSpot, "id">) => void
}) {
  const [open, setOpen] = useState(false)
  const [planet, setPlanet] = useState("")
  const [resources, setResources] = useState("")
  const [tip, setTip] = useState("")

  function hydrate() {
    setPlanet(initial?.planet ?? "")
    setResources(initial?.resources ?? "")
    setTip(initial?.tip ?? "")
  }

  function submit() {
    if (!planet.trim()) return
    onSubmit({
      planet: planet.trim(),
      resources: resources.trim(),
      tip: tip.trim(),
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
          <DialogTitle>{isEdit ? "Edit farm spot" : "Add a farm spot"}</DialogTitle>
          <DialogDescription>
            Note a location that drops multiple needed resources.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="farm-planet">Planet / node</Label>
            <Input
              id="farm-planet"
              value={planet}
              onChange={(e) => setPlanet(e.target.value)}
              placeholder="Neptune"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="farm-resources">Resources</Label>
            <Input
              id="farm-resources"
              value={resources}
              onChange={(e) => setResources(e.target.value)}
              placeholder="Ferrite + Nano Spores"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="farm-tip">Tip</Label>
            <Input
              id="farm-tip"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              placeholder="Run a Survival/Defense for both at once."
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!planet.trim()}>
            {isEdit ? "Save changes" : "Add farm spot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function FarmOverlapCard({
  farmOverlap,
  onAdd,
  onUpdate,
  onRemove,
}: {
  farmOverlap: FarmSpot[]
  onAdd: (spot: Omit<FarmSpot, "id">) => void
  onUpdate: (id: string, spot: Omit<FarmSpot, "id">) => void
  onRemove: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-5 text-primary" />
          Farm Overlap
        </CardTitle>
        <FarmFormDialog
          onSubmit={onAdd}
          trigger={
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="size-4" />
              Add
            </Button>
          }
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {farmOverlap.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No farm spots yet. Use Add to note one.
          </p>
        ) : null}
        {farmOverlap.map((spot) => (
          <div
            key={spot.id}
            className="group rounded-xl border border-border bg-secondary/40 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-primary">{spot.planet}</p>
                <p className="text-sm text-foreground">{spot.resources}</p>
              </div>
              <div className="flex items-center gap-1">
                <FarmFormDialog
                  initial={spot}
                  onSubmit={(s) => onUpdate(spot.id, s)}
                  trigger={
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                      aria-label={`Edit ${spot.planet}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  onClick={() => onRemove(spot.id)}
                  aria-label={`Remove ${spot.planet}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            {spot.tip ? (
              <p className="mt-1 text-sm text-muted-foreground">{spot.tip}</p>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
