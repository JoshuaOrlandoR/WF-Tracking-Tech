"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
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
import type { Task } from "@/lib/warframe-data"
import { cn, formatNum } from "@/lib/utils"
import { Pencil, Plus, Target, Trash2 } from "lucide-react"

function TaskFormDialog({
  trigger,
  initial,
  onSubmit,
}: {
  trigger: React.ReactElement
  initial?: Task
  onSubmit: (task: Omit<Task, "id">) => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [detail, setDetail] = useState("")

  function hydrate() {
    setName(initial?.name ?? "")
    setDetail(initial?.detail ?? "")
  }

  function submit() {
    if (!name.trim()) return
    onSubmit({ name: name.trim(), detail: detail.trim() })
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
          <DialogTitle>{isEdit ? "Edit priority" : "Add a priority"}</DialogTitle>
          <DialogDescription>
            Track an ongoing goal you chip away at over time.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-name">Name</Label>
            <Input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rescue Mission"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-detail">Detail</Label>
            <Input
              id="task-detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Farm Specter Blueprints."
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!name.trim()}>
            {isEdit ? "Save changes" : "Add priority"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function PrioritiesCard({
  tasks,
  checkedTasks,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onRemoveTask,
  caviaStanding,
  caviaGoal,
  onCaviaChange,
  onCaviaGoalChange,
  calendarProgress,
  onCalendarChange,
}: {
  tasks: Task[]
  checkedTasks: Record<string, boolean>
  onToggleTask: (id: string) => void
  onAddTask: (task: Omit<Task, "id">) => void
  onUpdateTask: (id: string, task: Omit<Task, "id">) => void
  onRemoveTask: (id: string) => void
  caviaStanding: number
  caviaGoal: number
  onCaviaChange: (value: number) => void
  onCaviaGoalChange: (value: number) => void
  calendarProgress: number
  onCalendarChange: (value: number) => void
}) {
  const caviaPct = Math.round((caviaStanding / caviaGoal) * 100)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <Target className="size-5 text-primary" />
          Ongoing Priorities
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Long-run value</Badge>
          <TaskFormDialog
            onSubmit={onAddTask}
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
        {tasks.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            No priorities yet. Use Add to track one.
          </p>
        ) : null}
        {tasks.map((task) => {
          const isChecked = !!checkedTasks[task.id]
          return (
            <div
              key={task.id}
              className="group rounded-xl border border-border bg-secondary/40 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => onToggleTask(task.id)}
                    aria-label={task.name}
                  />
                  <span
                    className={cn(
                      "font-semibold",
                      isChecked && "text-muted-foreground line-through",
                    )}
                  >
                    {task.name}
                  </span>
                </label>
                <div className="flex items-center gap-1">
                  <TaskFormDialog
                    initial={task}
                    onSubmit={(t) => onUpdateTask(task.id, t)}
                    trigger={
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                        aria-label={`Edit ${task.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    onClick={() => onRemoveTask(task.id)}
                    aria-label={`Remove ${task.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              {task.detail ? (
                <p className="mt-1.5 pl-7 text-sm text-muted-foreground">
                  {task.detail}
                </p>
              ) : null}
            </div>
          )
        })}

        <div className="rounded-xl border border-border bg-secondary/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <strong>Cavia Standing</strong>
            <Input
              type="number"
              min={0}
              max={caviaGoal}
              step={500}
              value={caviaStanding}
              onChange={(e) =>
                onCaviaChange(
                  Math.min(caviaGoal, Math.max(0, Number(e.target.value || 0))),
                )
              }
              className="h-9 w-28 text-right font-mono tabular-nums"
              aria-label="Cavia standing"
            />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Label
              htmlFor="cavia-goal"
              className="text-sm text-muted-foreground"
            >
              Weekly goal
            </Label>
            <Input
              id="cavia-goal"
              type="number"
              min={1}
              step={500}
              value={caviaGoal}
              onChange={(e) =>
                onCaviaGoalChange(Math.max(1, Number(e.target.value || 1)))
              }
              className="h-8 w-28 text-right font-mono tabular-nums"
              aria-label="Cavia weekly goal"
            />
          </div>
          <Progress value={caviaPct} className="mt-3" />
          <p className="mt-1.5 text-sm text-muted-foreground tabular-nums">
            {formatNum(caviaStanding)} / {formatNum(caviaGoal)} standing
          </p>
        </div>

        <div className="rounded-xl border border-border bg-secondary/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <strong>1999 Calendar Buffs</strong>
            <Input
              type="number"
              min={0}
              max={100}
              step={5}
              value={calendarProgress}
              onChange={(e) =>
                onCalendarChange(
                  Math.min(100, Math.max(0, Number(e.target.value || 0))),
                )
              }
              className="h-9 w-28 text-right font-mono tabular-nums"
              aria-label="Calendar progress percent"
            />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Chip away through the week so the end-of-week ETA is easier.
          </p>
          <Progress value={calendarProgress} className="mt-3" />
          <p className="mt-1.5 text-sm text-muted-foreground tabular-nums">
            {calendarProgress}% complete
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
