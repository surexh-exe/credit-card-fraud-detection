"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, AlertTriangle, CheckCircle, Activity, Database, Info } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useDataStore } from "@/lib/data-store"
import Link from "next/link"

interface SimulatedTransaction {
  id: string
  timestamp: Date
  amount: number
  contractType: string
  incomeType: string
  isFraud: boolean
  fraudScore: number
  extSource2: number
  creditRatio: number
}

interface FraudRatePoint {
  time: string
  rate: number
  count: number
}

export function SimulationEngine() {
  const dataStore = useDataStore()
  const [isRunning, setIsRunning] = useState(false)
  const [transactions, setTransactions] = useState<SimulatedTransaction[]>([])
  const [fraudRateHistory, setFraudRateHistory] = useState<FraudRatePoint[]>([])
  const [stats, setStats] = useState({
    total: 0,
    fraudulent: 0,
    genuine: 0,
    avgFraudScore: 0,
  })
  const [dataMode, setDataMode] = useState<"random" | "kaggle">("random")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const transactionCountRef = useRef(0)
  const kaggleIndexRef = useRef(0)

  const kaggleDataAvailable = dataStore.dataLoaded && dataStore.applications.length > 0

  // Home Credit based data
  const contractTypes = ["Cash loans", "Revolving loans"]
  const incomeTypes = ["Working", "Commercial associate", "Pensioner", "State servant"]

  const generateTransaction = useCallback((): SimulatedTransaction => {
    transactionCountRef.current += 1

    if (dataMode === "kaggle" && kaggleDataAvailable) {
      const app = dataStore.applications[kaggleIndexRef.current % dataStore.applications.length]
      kaggleIndexRef.current += 1

      const isFraud = app.TARGET === 1 || app.RISK_SCORE > 60

      return {
        id: `SIM-${app.SK_ID_CURR}`,
        timestamp: new Date(),
        amount: app.AMT_CREDIT,
        contractType: app.NAME_CONTRACT_TYPE,
        incomeType: app.NAME_INCOME_TYPE,
        isFraud,
        fraudScore: app.RISK_SCORE / 100,
        extSource2: app.EXT_SOURCE_2,
        creditRatio: app.CREDIT_INCOME_RATIO,
      }
    }

    // Random mode
    const isFraud = Math.random() > 0.88
    const baseAmount = isFraud ? Math.random() * 1500000 + 200000 : Math.random() * 500000 + 50000
    const fraudScore = isFraud ? 0.6 + Math.random() * 0.4 : Math.random() * 0.4

    return {
      id: `SIM-${String(transactionCountRef.current).padStart(6, "0")}`,
      timestamp: new Date(),
      amount: Math.round(baseAmount),
      contractType: contractTypes[Math.floor(Math.random() * contractTypes.length)],
      incomeType: incomeTypes[Math.floor(Math.random() * incomeTypes.length)],
      isFraud,
      fraudScore,
      extSource2: Math.random(),
      creditRatio: 2 + Math.random() * 6,
    }
  }, [dataMode, kaggleDataAvailable, dataStore.applications])

  const startSimulation = () => {
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      const newTransaction = generateTransaction()

      setTransactions((prev) => {
        const updated = [newTransaction, ...prev].slice(0, 50)
        return updated
      })

      setStats((prev) => {
        const newTotal = prev.total + 1
        const newFraudulent = prev.fraudulent + (newTransaction.isFraud ? 1 : 0)
        const newGenuine = newTotal - newFraudulent
        const newAvgScore = (prev.avgFraudScore * prev.total + newTransaction.fraudScore) / newTotal

        return {
          total: newTotal,
          fraudulent: newFraudulent,
          genuine: newGenuine,
          avgFraudScore: newAvgScore,
        }
      })

      if (transactionCountRef.current % 5 === 0) {
        setFraudRateHistory((prev) => {
          const recentTransactions = [newTransaction, ...transactions].slice(0, 20)
          const recentFraudRate =
            recentTransactions.length > 0
              ? (recentTransactions.filter((t) => t.isFraud).length / recentTransactions.length) * 100
              : 0

          const newPoint = {
            time: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            rate: Math.round(recentFraudRate * 10) / 10,
            count: transactionCountRef.current,
          }

          return [...prev, newPoint].slice(-20)
        })
      }
    }, 800)
  }

  const stopSimulation = () => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const resetSimulation = () => {
    stopSimulation()
    setTransactions([])
    setFraudRateHistory([])
    setStats({ total: 0, fraudulent: 0, genuine: 0, avgFraudScore: 0 })
    transactionCountRef.current = 0
    kaggleIndexRef.current = 0
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const fraudRate = stats.total > 0 ? ((stats.fraudulent / stats.total) * 100).toFixed(1) : "0.0"

  return (
    <div className="p-8">
      <div className="max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Fraud Simulation</h1>
            <p className="text-muted-foreground">Real-time simulation based on Home Credit Default Risk patterns</p>
          </div>
          <div className="flex items-center gap-3">
            {!isRunning ? (
              <Button onClick={startSimulation} className="bg-green-600 hover:bg-green-700 text-white">
                <Play className="w-4 h-4 mr-2" />
                Start Simulation
              </Button>
            ) : (
              <Button onClick={stopSimulation} variant="destructive">
                <Pause className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}
            <Button onClick={resetSimulation} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Data Mode Selection */}
        <Card
          className={`p-4 border mb-6 ${kaggleDataAvailable ? "border-green-500/30 bg-green-500/5" : "border-primary/30 bg-primary/5"}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className={`w-5 h-5 ${kaggleDataAvailable ? "text-green-600" : "text-primary"}`} />
              <div>
                {kaggleDataAvailable ? (
                  <>
                    <p className="text-sm font-medium text-foreground">
                      Kaggle Data Available: {dataStore.recordCount} records
                    </p>
                    <p className="text-xs text-muted-foreground">Simulation can use actual dataset patterns</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">No Kaggle data loaded</p>
                    <p className="text-xs text-muted-foreground">
                      Load data from the Kaggle Data page for realistic simulation
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {kaggleDataAvailable && (
                <select
                  value={dataMode}
                  onChange={(e) => setDataMode(e.target.value as "random" | "kaggle")}
                  className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background"
                  disabled={isRunning}
                >
                  <option value="random">Random Generation</option>
                  <option value="kaggle">Use Kaggle Data</option>
                </select>
              )}
              <Link href="/dashboard/kaggle-data">
                <Button variant="outline" size="sm">
                  {kaggleDataAvailable ? "Manage Data" : "Load Data"}
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Simulation Info */}
        <Card className="p-4 border border-border mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Simulation Based on Home Credit Features</p>
              <p className="text-xs text-muted-foreground">
                Uses AMT_CREDIT, NAME_CONTRACT_TYPE, NAME_INCOME_TYPE, EXT_SOURCE scores, and CREDIT_INCOME_RATIO to
                simulate realistic default risk scenarios
              </p>
            </div>
          </div>
        </Card>

        {/* Live Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4 border border-border">
            <div className="flex items-center gap-3">
              <Activity className={`w-5 h-5 ${isRunning ? "text-green-500 animate-pulse" : "text-muted-foreground"}`} />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold text-foreground">{isRunning ? "Running" : "Stopped"}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Processed</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </Card>
          <Card className="p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-1">High Risk Detected</p>
            <p className="text-2xl font-bold text-destructive">{stats.fraudulent}</p>
          </Card>
          <Card className="p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Default Rate</p>
            <p className="text-2xl font-bold text-foreground">{fraudRate}%</p>
          </Card>
          <Card className="p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Data Mode</p>
            <p className="text-lg font-semibold text-foreground capitalize">{dataMode}</p>
          </Card>
        </div>

        {/* Default Rate Chart */}
        <Card className="p-6 border border-border mb-8">
          <h3 className="font-semibold text-foreground mb-4">Default Rate Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={fraudRateHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={10} interval="preserveStartEnd" />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                domain={[0, 30]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value}%`, "Default Rate"]}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--destructive)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Live Application Feed */}
        <Card className="border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Live Application Feed</h3>
            <span className="text-sm text-muted-foreground">Showing latest {transactions.length} applications</span>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start the simulation to see live applications</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {transactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className={`p-4 flex items-center gap-4 ${
                      transaction.isFraud ? "bg-destructive/5" : ""
                    } ${index === 0 ? "animate-pulse" : ""}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.isFraud ? "bg-destructive/10" : "bg-green-500/10"
                      }`}
                    >
                      {transaction.isFraud ? (
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-foreground">{transaction.id}</span>
                        {transaction.isFraud && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                            HIGH RISK
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {transaction.contractType} | {transaction.incomeType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">${transaction.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        Risk: {(transaction.fraudScore * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
