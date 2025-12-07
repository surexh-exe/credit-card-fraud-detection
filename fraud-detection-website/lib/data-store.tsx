"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { HomeCreditApplication, BureauRecord, PreviousApplication } from "@/lib/kaggle-data"

interface AnalysisResults {
  analyzedCount: number
  highRisk: number
  mediumRisk: number
  lowRisk: number
  timestamp: string
}

interface DataStore {
  // Kaggle data
  applications: HomeCreditApplication[]
  bureauRecords: BureauRecord[]
  previousApps: PreviousApplication[]

  // Analysis results (persisted)
  analysisResults: AnalysisResults | null

  // Metadata
  dataLoaded: boolean
  dataSource: "kaggle" | "upload" | null
  loadedAt: Date | null
  recordCount: number

  // Actions
  setKaggleData: (
    applications: HomeCreditApplication[],
    bureau: BureauRecord[],
    previous: PreviousApplication[],
  ) => void
  setAnalysisResults: (results: AnalysisResults) => void
  clearData: () => void
}

const DataStoreContext = createContext<DataStore | null>(null)

const STORAGE_KEY = "fraud_detection_data_store"

function saveToStorage(data: {
  applications: HomeCreditApplication[]
  bureauRecords: BureauRecord[]
  previousApps: PreviousApplication[]
  analysisResults: AnalysisResults | null
  loadedAt: string | null
}) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn("Failed to save to localStorage:", e)
    }
  }
}

function loadFromStorage(): {
  applications: HomeCreditApplication[]
  bureauRecords: BureauRecord[]
  previousApps: PreviousApplication[]
  analysisResults: AnalysisResults | null
  loadedAt: Date | null
} | null {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          ...parsed,
          loadedAt: parsed.loadedAt ? new Date(parsed.loadedAt) : null,
        }
      }
    } catch (e) {
      console.warn("Failed to load from localStorage:", e)
    }
  }
  return null
}

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<HomeCreditApplication[]>([])
  const [bureauRecords, setBureauRecords] = useState<BureauRecord[]>([])
  const [previousApps, setPreviousApps] = useState<PreviousApplication[]>([])
  const [analysisResults, setAnalysisResultsState] = useState<AnalysisResults | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [dataSource, setDataSource] = useState<"kaggle" | "upload" | null>(null)
  const [loadedAt, setLoadedAt] = useState<Date | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const stored = loadFromStorage()
    if (stored && stored.applications.length > 0) {
      setApplications(stored.applications)
      setBureauRecords(stored.bureauRecords)
      setPreviousApps(stored.previousApps)
      setAnalysisResultsState(stored.analysisResults)
      setDataLoaded(true)
      setDataSource("kaggle")
      setLoadedAt(stored.loadedAt)
    }
    setInitialized(true)
  }, [])

  const setKaggleData = (apps: HomeCreditApplication[], bureau: BureauRecord[], previous: PreviousApplication[]) => {
    setApplications(apps)
    setBureauRecords(bureau)
    setPreviousApps(previous)
    setDataLoaded(true)
    setDataSource("kaggle")
    const now = new Date()
    setLoadedAt(now)

    saveToStorage({
      applications: apps,
      bureauRecords: bureau,
      previousApps: previous,
      analysisResults,
      loadedAt: now.toISOString(),
    })
  }

  const setAnalysisResults = (results: AnalysisResults) => {
    setAnalysisResultsState(results)
    saveToStorage({
      applications,
      bureauRecords,
      previousApps,
      analysisResults: results,
      loadedAt: loadedAt?.toISOString() || null,
    })
  }

  const clearData = () => {
    setApplications([])
    setBureauRecords([])
    setPreviousApps([])
    setAnalysisResultsState(null)
    setDataLoaded(false)
    setDataSource(null)
    setLoadedAt(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  if (!initialized) {
    return null
  }

  return (
    <DataStoreContext.Provider
      value={{
        applications,
        bureauRecords,
        previousApps,
        analysisResults,
        dataLoaded,
        dataSource,
        loadedAt,
        recordCount: applications.length,
        setKaggleData,
        setAnalysisResults,
        clearData,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  )
}

export function useDataStore() {
  const context = useContext(DataStoreContext)
  if (!context) {
    throw new Error("useDataStore must be used within a DataStoreProvider")
  }
  return context
}
