"use client"

import { useCallback, useEffect, useState } from "react"
import {
  DEFAULT_CAVIA_GOAL,
  DEFAULT_CRAFTS,
  DEFAULT_FARM_OVERLAP,
  DEFAULT_HELMINTH,
  DEFAULT_RESOURCES,
  DEFAULT_TASKS,
  type Craft,
  type FarmSpot,
  type HelminthStatus,
  type ResourceDef,
  type Task,
} from "./warframe-data"

export type TrackerState = {
  crafts: Craft[]
  resources: ResourceDef[]
  helminth: string[]
  tasks: Task[]
  farmOverlap: FarmSpot[]
  caviaGoal: number
  checkedCrafts: Record<string, boolean>
  checkedTasks: Record<string, boolean>
  inventory: Record<string, number>
  caviaStanding: number
  calendarProgress: number
  helminthStatus: Record<string, HelminthStatus>
}

const STORAGE_KEY = "warframeOperationsTracker.v4"

const defaultState: TrackerState = {
  crafts: DEFAULT_CRAFTS,
  resources: DEFAULT_RESOURCES,
  helminth: DEFAULT_HELMINTH,
  tasks: DEFAULT_TASKS,
  farmOverlap: DEFAULT_FARM_OVERLAP,
  caviaGoal: DEFAULT_CAVIA_GOAL,
  checkedCrafts: {},
  checkedTasks: {},
  inventory: {},
  caviaStanding: 0,
  calendarProgress: 0,
  helminthStatus: {},
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`
}

export function useTracker() {
  const [state, setState] = useState<TrackerState>(defaultState)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setState({ ...defaultState, ...JSON.parse(raw) })
    } catch {
      // ignore corrupt data
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, loaded])

  const toggleCraft = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      checkedCrafts: { ...s.checkedCrafts, [id]: !s.checkedCrafts[id] },
    }))
  }, [])

  const toggleTask = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      checkedTasks: { ...s.checkedTasks, [id]: !s.checkedTasks[id] },
    }))
  }, [])

  const setInventory = useCallback((resource: string, value: number) => {
    setState((s) => ({
      ...s,
      inventory: { ...s.inventory, [resource]: value },
    }))
  }, [])

  const setCaviaStanding = useCallback((value: number) => {
    setState((s) => ({ ...s, caviaStanding: value }))
  }, [])

  const setCaviaGoal = useCallback((value: number) => {
    setState((s) => ({ ...s, caviaGoal: Math.max(1, value) }))
  }, [])

  const setCalendarProgress = useCallback((value: number) => {
    setState((s) => ({ ...s, calendarProgress: value }))
  }, [])

  const setHelminthStatus = useCallback(
    (resource: string, status: HelminthStatus) => {
      setState((s) => ({
        ...s,
        helminthStatus: { ...s.helminthStatus, [resource]: status },
      }))
    },
    [],
  )

  // --- Crafts ---
  const addCraft = useCallback((craft: Omit<Craft, "id">) => {
    setState((s) => ({
      ...s,
      crafts: [...s.crafts, { ...craft, id: makeId("craft") }],
    }))
  }, [])

  const updateCraft = useCallback((id: string, craft: Omit<Craft, "id">) => {
    setState((s) => ({
      ...s,
      crafts: s.crafts.map((c) => (c.id === id ? { ...craft, id } : c)),
    }))
  }, [])

  const removeCraft = useCallback((id: string) => {
    setState((s) => {
      const { [id]: _omit, ...checkedCrafts } = s.checkedCrafts
      return {
        ...s,
        crafts: s.crafts.filter((c) => c.id !== id),
        checkedCrafts,
      }
    })
  }, [])

  // --- Resources ---
  const addResource = useCallback((resource: ResourceDef) => {
    setState((s) => {
      const exists = s.resources.some(
        (r) => r.name.toLowerCase() === resource.name.toLowerCase(),
      )
      if (exists) return s
      return { ...s, resources: [...s.resources, resource] }
    })
  }, [])

  const updateResource = useCallback(
    (originalName: string, resource: ResourceDef) => {
      setState((s) => ({
        ...s,
        resources: s.resources.map((r) =>
          r.name === originalName ? resource : r,
        ),
      }))
    },
    [],
  )

  const removeResource = useCallback((name: string) => {
    setState((s) => ({
      ...s,
      resources: s.resources.filter((r) => r.name !== name),
    }))
  }, [])

  // --- Helminth ---
  const addHelminth = useCallback((name: string) => {
    setState((s) => {
      const exists = s.helminth.some(
        (h) => h.toLowerCase() === name.toLowerCase(),
      )
      if (exists) return s
      return { ...s, helminth: [...s.helminth, name] }
    })
  }, [])

  const updateHelminth = useCallback(
    (originalName: string, name: string) => {
      setState((s) => {
        const status = { ...s.helminthStatus }
        if (originalName !== name && status[originalName] !== undefined) {
          status[name] = status[originalName]
          delete status[originalName]
        }
        return {
          ...s,
          helminth: s.helminth.map((h) => (h === originalName ? name : h)),
          helminthStatus: status,
        }
      })
    },
    [],
  )

  const removeHelminth = useCallback((name: string) => {
    setState((s) => ({
      ...s,
      helminth: s.helminth.filter((h) => h !== name),
    }))
  }, [])

  // --- Tasks ---
  const addTask = useCallback((task: Omit<Task, "id">) => {
    setState((s) => ({
      ...s,
      tasks: [...s.tasks, { ...task, id: makeId("task") }],
    }))
  }, [])

  const updateTask = useCallback((id: string, task: Omit<Task, "id">) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...task, id } : t)),
    }))
  }, [])

  const removeTask = useCallback((id: string) => {
    setState((s) => {
      const { [id]: _omit, ...checkedTasks } = s.checkedTasks
      return {
        ...s,
        tasks: s.tasks.filter((t) => t.id !== id),
        checkedTasks,
      }
    })
  }, [])

  // --- Farm overlap ---
  const addFarmSpot = useCallback((spot: Omit<FarmSpot, "id">) => {
    setState((s) => ({
      ...s,
      farmOverlap: [...s.farmOverlap, { ...spot, id: makeId("spot") }],
    }))
  }, [])

  const updateFarmSpot = useCallback(
    (id: string, spot: Omit<FarmSpot, "id">) => {
      setState((s) => ({
        ...s,
        farmOverlap: s.farmOverlap.map((f) =>
          f.id === id ? { ...spot, id } : f,
        ),
      }))
    },
    [],
  )

  const removeFarmSpot = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      farmOverlap: s.farmOverlap.filter((f) => f.id !== id),
    }))
  }, [])

  const resetDaily = useCallback(() => {
    setState((s) => ({ ...s, checkedCrafts: {}, checkedTasks: {} }))
  }, [])

  const resetAll = useCallback(() => {
    setState(defaultState)
  }, [])

  return {
    state,
    loaded,
    toggleCraft,
    toggleTask,
    setInventory,
    setCaviaStanding,
    setCaviaGoal,
    setCalendarProgress,
    setHelminthStatus,
    addCraft,
    updateCraft,
    removeCraft,
    addResource,
    updateResource,
    removeResource,
    addHelminth,
    updateHelminth,
    removeHelminth,
    addTask,
    updateTask,
    removeTask,
    addFarmSpot,
    updateFarmSpot,
    removeFarmSpot,
    resetDaily,
    resetAll,
  }
}
