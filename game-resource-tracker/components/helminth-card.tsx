"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HELMINTH_OPTIONS, type HelminthStatus } from "@/lib/warframe-data"
import { FlaskConical, Pencil, Plus, Trash2 } from "lucide-react"

const STATUS_COLOR: Record<HelminthStatus, string> = {
  TBD: "text-muted-foreground",
  Low: "text-destructive",
  Okay: "text-accent",
  Stocked: "text-chart-3",
}

function RenameDialog({
  current,
  onSubmit,
}: {
  current: string
  onSubmit: (name: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(current)

  function submit() {
    if (!name.trim()) return
    onSubmit(name.trim())
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) setName(current)
        setOpen(o)
      }}
    >
      <DialogTrigger
        render={
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
            aria-label={`Edit ${current}`}
          >
            <Pencil className="size-4" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename resource</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="helminth-rename">Name</Label>
          <Input
            id="helminth-rename"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit()
            }}
          />
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!name.trim()}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function HelminthCard({
  watchlist,
  status,
  onStatusChange,
  onAdd,
  onUpdate,
  onRemove,
}: {
  watchlist: string[]
  status: Record<string, HelminthStatus>
  onStatusChange: (resource: string, value: HelminthStatus) => void
  onAdd: (name: string) => void
  onUpdate: (originalName: string, name: string) => void
  onRemove: (name: string) => void
}) {
  const [value, setValue] = useState("")

  function submit() {
    const name = value.trim()
    if (!name) return
    onAdd(name)
    setValue("")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="size-5 text-primary" />
          Helminth Watchlist
        </CardTitle>
        <Badge variant="secondary">No quantity target</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Add a resource to watch…"
          />
          <Button type="submit" size="icon" disabled={!value.trim()} aria-label="Add resource">
            <Plus className="size-4" />
          </Button>
        </form>

        {watchlist.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Watchlist is empty.
          </p>
        ) : null}

        {watchlist.map((resource) => {
          const value = status[resource] ?? "TBD"
          return (
            <div
              key={resource}
              className="group flex items-center justify-between gap-2 rounded-xl border border-border bg-secondary/40 p-3"
            >
              <span className={`font-medium ${STATUS_COLOR[value]}`}>
                {resource}
              </span>
              <div className="flex items-center gap-1">
                <Select
                  value={value}
                  onValueChange={(v) =>
                    onStatusChange(resource, v as HelminthStatus)
                  }
                >
                  <SelectTrigger
                    className="w-32"
                    aria-label={`${resource} status`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HELMINTH_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <RenameDialog
                  current={resource}
                  onSubmit={(name) => onUpdate(resource, name)}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  onClick={() => onRemove(resource)}
                  aria-label={`Remove ${resource}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
