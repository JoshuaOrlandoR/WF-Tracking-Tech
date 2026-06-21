"use client"

import { CraftingCard } from "@/components/crafting-card"
import { ResourcesCard } from "@/components/resources-card"
import { PrioritiesCard } from "@/components/priorities-card"
import { HelminthCard } from "@/components/helminth-card"
import { FarmOverlapCard } from "@/components/farm-overlap-card"
import { TrackerHeader } from "@/components/tracker-header"
import { SummaryBar } from "@/components/summary-bar"
import { useTracker } from "@/lib/use-tracker"

export default function Page() {
  const t = useTracker()
  const { crafts, resources } = t.state

  // Combined need per resource: craft consumption + manual daily needs.
  const totals: Record<string, number> = {}
  for (const craft of crafts) {
    for (const [resource, amount] of Object.entries(craft.resources)) {
      totals[resource] = (totals[resource] ?? 0) + amount
    }
  }
  for (const def of resources) {
    totals[def.name] = (totals[def.name] ?? 0) + def.dailyNeed
  }

  const craftsDone = crafts.filter((c) => t.state.checkedCrafts[c.id]).length
  const shortfalls = Object.entries(totals).filter(
    ([resource, need]) => Number(t.state.inventory[resource] || 0) - need < 0,
  ).length
  const caviaPct = Math.round((t.state.caviaStanding / t.state.caviaGoal) * 100)
  const trackedResources = Object.keys(totals).length

  const resourceNames = Array.from(
    new Set([
      ...resources.map((r) => r.name),
      ...crafts.flatMap((c) => Object.keys(c.resources)),
    ]),
  )

  function handleExport() {
    const blob = new Blob([JSON.stringify(t.state, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "warframe-tracker-save.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleResetAll() {
    if (confirm("Reset all saved tracker data?")) t.resetAll()
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      <TrackerHeader
        onResetDaily={t.resetDaily}
        onExport={handleExport}
        onResetAll={handleResetAll}
      />

      <div className="mt-8">
        <SummaryBar
          craftsDone={craftsDone}
          craftsTotal={crafts.length}
          shortfalls={shortfalls}
          caviaPct={caviaPct}
          trackedResources={trackedResources}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-6">
          <CraftingCard
            crafts={crafts}
            checked={t.state.checkedCrafts}
            onToggle={t.toggleCraft}
            onAdd={t.addCraft}
            onUpdate={t.updateCraft}
            onRemove={t.removeCraft}
            resourceNames={resourceNames}
          />
          <ResourcesCard
            crafts={crafts}
            resources={resources}
            inventory={t.state.inventory}
            onInventoryChange={t.setInventory}
            onAdd={t.addResource}
            onUpdate={t.updateResource}
            onRemove={t.removeResource}
          />
        </div>

        <div className="flex flex-col gap-6">
          <PrioritiesCard
            tasks={t.state.tasks}
            checkedTasks={t.state.checkedTasks}
            onToggleTask={t.toggleTask}
            onAddTask={t.addTask}
            onUpdateTask={t.updateTask}
            onRemoveTask={t.removeTask}
            caviaStanding={t.state.caviaStanding}
            caviaGoal={t.state.caviaGoal}
            onCaviaChange={t.setCaviaStanding}
            onCaviaGoalChange={t.setCaviaGoal}
            calendarProgress={t.state.calendarProgress}
            onCalendarChange={t.setCalendarProgress}
          />
          <HelminthCard
            watchlist={t.state.helminth}
            status={t.state.helminthStatus}
            onStatusChange={t.setHelminthStatus}
            onAdd={t.addHelminth}
            onUpdate={t.updateHelminth}
            onRemove={t.removeHelminth}
          />
          <FarmOverlapCard
            farmOverlap={t.state.farmOverlap}
            onAdd={t.addFarmSpot}
            onUpdate={t.updateFarmSpot}
            onRemove={t.removeFarmSpot}
          />
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Data is saved to this browser only. Use Export to back up your save.
      </p>
    </main>
  )
}
