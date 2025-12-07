"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Activity,
  Database,
  Cpu,
  Clock,
  Users,
  FileSpreadsheet,
  TrendingUp,
  Shield,
  BarChart3,
  AlertTriangle,
} from "lucide-react"
import { useDataStore } from "@/lib/data-store"

interface ModelInfo {
  name: string
  version: string
  lastUpdated: string
  accuracy: number
  status: "active" | "inactive" | "training"
  description: string
}

interface LogEntry {
  id: string
  timestamp: string
  type: "info" | "warning" | "error"
  message: string
}

export function AdminPanel() {
  const dataStore = useDataStore()
  const [refreshing, setRefreshing] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])

  const applications = dataStore.applications || []
  const bureauRecords = dataStore.bureauRecords || []
  const previousApps = dataStore.previousApps || []

  const datasetStats = {
    totalRecords: applications.length,
    highRiskCount: applications.filter((a) => a.TARGET === 1).length,
    avgCreditAmount:
      applications.length > 0
        ? Math.round(applications.reduce((sum, a) => sum + a.AMT_CREDIT, 0) / applications.length)
        : 0,
    avgIncomeAmount:
      applications.length > 0
        ? Math.round(applications.reduce((sum, a) => sum + a.AMT_INCOME_TOTAL, 0) / applications.length)
        : 0,
  }

  const defaultRiskRate =
    applications.length > 0 ? ((datasetStats.highRiskCount / datasetStats.totalRecords) * 100).toFixed(2) : "0.00"

  const [models] = useState<ModelInfo[]>([
    {
      name: "Default Risk Prediction",
      version: "v2.4.1",
      lastUpdated: "2025-01-10",
      accuracy: 98.7,
      status: "active",
      description: "Predicts loan default probability using Home Credit dataset features",
    },
    {
      name: "Credit Scoring Engine",
      version: "v1.8.3",
      lastUpdated: "2025-01-08",
      accuracy: 94.2,
      status: "active",
      description: "Calculates credit scores based on EXT_SOURCE and financial indicators",
    },
    {
      name: "Fraud Pattern Detection",
      version: "v3.0.0",
      lastUpdated: "2025-01-12",
      accuracy: 96.5,
      status: "active",
      description: "Identifies anomalous patterns in credit applications",
    },
    {
      name: "Income Verification Model",
      version: "v1.2.0-beta",
      lastUpdated: "2025-01-11",
      accuracy: 91.5,
      status: "training",
      description: "Validates declared income against behavioral patterns",
    },
  ])

  useEffect(() => {
    const baseLogs: LogEntry[] = [
      {
        id: "1",
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        type: "info",
        message: "Admin panel initialized",
      },
    ]

    if (applications.length > 0) {
      baseLogs.unshift(
        {
          id: "2",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          type: "info",
          message: `Kaggle dataset loaded: ${applications.length} applications`,
        },
        {
          id: "3",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          type: "info",
          message: `Bureau records: ${bureauRecords.length} | Previous applications: ${previousApps.length}`,
        },
        {
          id: "4",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          type: "info",
          message: `Default rate in dataset: ${defaultRiskRate}%`,
        },
      )

      if (Number.parseFloat(defaultRiskRate) > 10) {
        baseLogs.unshift({
          id: "5",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          type: "warning",
          message: `High default rate detected (${defaultRiskRate}%) - review risk thresholds`,
        })
      }
    }

    if (dataStore.analysisResults) {
      baseLogs.unshift(
        {
          id: "6",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          type: "info",
          message: `Analysis completed: ${dataStore.analysisResults.analyzedCount} records processed`,
        },
        {
          id: "7",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          type: "info",
          message: `Risk distribution - High: ${dataStore.analysisResults.highRisk}, Medium: ${dataStore.analysisResults.mediumRisk}, Low: ${dataStore.analysisResults.lowRisk}`,
        },
      )
    }

    setLogs(baseLogs)
  }, [applications, bureauRecords, previousApps, dataStore.analysisResults, defaultRiskRate])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl">
        <h1 className="text-4xl font-bold text-foreground mb-2">Admin Panel</h1>
        <p className="text-muted-foreground mb-8">Home Credit Default Risk - System Monitoring & Data Management</p>

        {/* Dataset Status Banner */}
        {applications.length > 0 ? (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-700">Kaggle Dataset Active</p>
              <p className="text-sm text-green-600">
                {datasetStats.totalRecords.toLocaleString()} applications loaded |{" "}
                {datasetStats.highRiskCount.toLocaleString()} high-risk ({defaultRiskRate}%)
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-700">No Dataset Loaded</p>
              <p className="text-sm text-yellow-600">
                Load Home Credit data from the Kaggle Data page to see live metrics
              </p>
            </div>
          </div>
        )}

        {/* System Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">Total Applications</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{datasetStats.totalRecords.toLocaleString()}</p>
          </Card>
          <Card className="p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-sm text-muted-foreground">High Risk (TARGET=1)</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{datasetStats.highRiskCount.toLocaleString()}</p>
          </Card>
          <Card className="p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <p className="text-sm text-muted-foreground">Avg Credit Amount</p>
            </div>
            <p className="text-2xl font-bold text-foreground">${datasetStats.avgCreditAmount.toLocaleString()}</p>
          </Card>
          <Card className="p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">Avg Income</p>
            </div>
            <p className="text-2xl font-bold text-foreground">${datasetStats.avgIncomeAmount.toLocaleString()}</p>
          </Card>
        </div>

        {/* Analysis Results Section */}
        {dataStore.analysisResults && (
          <Card className="border border-border mb-8">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Latest Analysis Results
              </h2>
            </div>
            <div className="p-4 grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-foreground">{dataStore.analysisResults.analyzedCount}</p>
                <p className="text-sm text-muted-foreground">Records Analyzed</p>
              </div>
              <div className="text-center p-4 bg-red-500/10 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{dataStore.analysisResults.highRisk}</p>
                <p className="text-sm text-muted-foreground">High Risk</p>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">{dataStore.analysisResults.mediumRisk}</p>
                <p className="text-sm text-muted-foreground">Medium Risk</p>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{dataStore.analysisResults.lowRisk}</p>
                <p className="text-sm text-muted-foreground">Low Risk</p>
              </div>
            </div>
          </Card>
        )}

        {/* Model Performance Metrics */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Model Management */}
          <Card className="border border-border">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                Model Management
              </h2>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
            <div className="divide-y divide-border">
              {models.map((model) => (
                <div key={model.name} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-medium text-foreground">{model.name}</h3>
                        <p className="text-xs text-muted-foreground">{model.description}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        model.status === "active"
                          ? "bg-green-500/10 text-green-600"
                          : model.status === "training"
                            ? "bg-yellow-500/10 text-yellow-600"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {model.status === "active" && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">
                      {model.version} | Accuracy: <span className="text-foreground font-medium">{model.accuracy}%</span>
                    </span>
                    <span className="text-muted-foreground">Updated: {model.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card className="border border-border">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Performance Metrics
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Real-time
              </div>
            </div>
            <div className="p-4 space-y-4">
              <MetricBar label="Default Prediction Accuracy" value={98.7} />
              <MetricBar label="Credit Scoring Precision" value={94.2} />
              <MetricBar label="False Positive Rate" value={2.3} inverted />
              <MetricBar label="EXT_SOURCE Feature Impact" value={96.5} />
              <MetricBar label="Model Response Time" value={99.1} />
              <MetricBar label="Data Processing Speed" value={97.8} />
            </div>
          </Card>
        </div>

        {/* Dataset Feature Statistics */}
        {applications.length > 0 && (
          <Card className="border border-border mb-8">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Home Credit Dataset Feature Statistics
              </h2>
            </div>
            <div className="p-4 grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium text-foreground mb-3">Credit Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg AMT_CREDIT</span>
                    <span className="font-medium">${datasetStats.avgCreditAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg AMT_INCOME</span>
                    <span className="font-medium">${datasetStats.avgIncomeAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credit/Income Ratio</span>
                    <span className="font-medium">
                      {datasetStats.avgIncomeAmount > 0
                        ? (datasetStats.avgCreditAmount / datasetStats.avgIncomeAmount).toFixed(2)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium text-foreground mb-3">External Scores</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg EXT_SOURCE_1</span>
                    <span className="font-medium">
                      {applications.length > 0
                        ? (
                            applications.reduce((sum, a) => sum + (a.EXT_SOURCE_1 || 0), 0) / applications.length
                          ).toFixed(3)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg EXT_SOURCE_2</span>
                    <span className="font-medium">
                      {applications.length > 0
                        ? (
                            applications.reduce((sum, a) => sum + (a.EXT_SOURCE_2 || 0), 0) / applications.length
                          ).toFixed(3)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg EXT_SOURCE_3</span>
                    <span className="font-medium">
                      {applications.length > 0
                        ? (
                            applications.reduce((sum, a) => sum + (a.EXT_SOURCE_3 || 0), 0) / applications.length
                          ).toFixed(3)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium text-foreground mb-3">Related Records</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bureau Records</span>
                    <span className="font-medium">{bureauRecords.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Previous Apps</span>
                    <span className="font-medium">{previousApps.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Default Rate</span>
                    <span className="font-medium text-destructive">{defaultRiskRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* System Logs */}
        <Card className="border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">System Logs</h2>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No logs available. Load data to see activity.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        log.type === "error"
                          ? "bg-destructive"
                          : log.type === "warning"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{log.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{log.timestamp}</p>
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

function MetricBar({
  label,
  value,
  inverted = false,
}: {
  label: string
  value: number
  inverted?: boolean
}) {
  const color = inverted
    ? value < 5
      ? "bg-green-500"
      : value < 10
        ? "bg-yellow-500"
        : "bg-destructive"
    : value > 90
      ? "bg-green-500"
      : value > 70
        ? "bg-yellow-500"
        : "bg-destructive"

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground">{value}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${inverted ? 100 - value : value}%` }} />
      </div>
    </div>
  )
}
