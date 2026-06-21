export type Craft = {
  id: string
  name: string
  qty: string
  note?: string
  resources: Record<string, number>
}

export type Task = {
  id: string
  name: string
  detail: string
}

export type FarmSpot = {
  id: string
  planet: string
  resources: string
  tip: string
}

export type HelminthStatus = "TBD" | "Low" | "Okay" | "Stocked"

export type ResourceDef = {
  name: string
  // Extra daily need on top of what crafts consume.
  dailyNeed: number
  sources: string[]
}

export const DEFAULT_CRAFTS: Craft[] = [
  {
    id: "vapor-specter",
    name: "Vapor Specter",
    qty: "×10",
    resources: { Salvage: 7500, Ferrite: 5000 },
  },
  {
    id: "stalker-specter",
    name: "Stalker Specter",
    qty: "×5",
    resources: { "Nano Spores": 2500, Salvage: 2500, Ferrite: 2500 },
  },
  {
    id: "cipher",
    name: "Cipher",
    qty: "×20",
    note: "2× batches of 10",
    resources: { Ferrite: 7200, "Nano Spores": 7200 },
  },
  {
    id: "squad-energy-restore",
    name: "Squad Energy Restore",
    qty: "×10",
    resources: { "Nano Spores": 3000, "Polymer Bundle": 500 },
  },
]

// Where each resource drops, broken out per planet for quick farm routing.
// dailyNeed is extra demand layered on top of what the crafts consume.
export const DEFAULT_RESOURCES: ResourceDef[] = [
  {
    name: "Ferrite",
    dailyNeed: 0,
    sources: ["Earth", "Mercury", "Neptune", "Void", "Lua", "Zariman"],
  },
  { name: "Salvage", dailyNeed: 0, sources: ["Mars", "Jupiter", "Sedna"] },
  {
    name: "Nano Spores",
    dailyNeed: 0,
    sources: ["Deimos", "Saturn", "Neptune", "Eris"],
  },
  { name: "Polymer Bundle", dailyNeed: 0, sources: ["Mercury", "Uranus"] },
]

// Best multi-resource farm spots — planets that drop more than one needed material.
export const DEFAULT_FARM_OVERLAP: FarmSpot[] = [
  {
    id: "neptune",
    planet: "Neptune",
    resources: "Ferrite + Nano Spores",
    tip: "Run a Survival/Defense for both at once.",
  },
  {
    id: "mercury",
    planet: "Mercury",
    resources: "Ferrite + Polymer Bundle",
    tip: "Apollodorus is a classic combined node.",
  },
  {
    id: "salvage-planets",
    planet: "Mars / Jupiter / Sedna",
    resources: "Salvage",
    tip: "High Salvage density across these planets.",
  },
]

export const DEFAULT_TASKS: Task[] = [
  {
    id: "rescue",
    name: "Rescue Mission",
    detail: "Farm Specter Blueprints.",
  },
]

export const DEFAULT_HELMINTH: string[] = [
  "Cubic Diodes",
  "Hexenon",
  "Hollvanian Pitchweave Fragments",
  "Ganglion",
  "Morphics",
  "Argon Crystals",
]

export const HELMINTH_OPTIONS: HelminthStatus[] = ["TBD", "Low", "Okay", "Stocked"]

export const DEFAULT_CAVIA_GOAL = 30000
