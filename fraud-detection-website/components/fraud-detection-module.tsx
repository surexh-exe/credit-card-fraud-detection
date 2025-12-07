"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download,
  Database,
  Info,
  User,
  Briefcase,
  CreditCard,
} from "lucide-react"
import { parseCSV, generateSampleTransactions } from "@/lib/csv-parser"
import { useDataStore } from "@/lib/data-store"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts"
import Link from "next/link"

interface AnalyzedTransaction {
  id: string
  skIdCurr: number
  amount: number
  income: number
  merchant: string
  category: string
  location: string
  time: string
  fraudScore: number
  riskLevel: "Low" | "Medium" | "High"
  explanation: string
  flagged: boolean
  extSource1: number
  extSource2: number
  extSource3: number
  creditIncomeRatio: number
  annuityIncomeRatio: number
  ageYears: number
  employedYears: number
  gender: string
  familyStatus: string
  children: number
  education: string
  housingType: string
  incomeType: string
  occupation: string
  ownCar: string
  ownRealty: string
  target: number
  [key: string]: string | number | boolean
}

interface AnalysisSummary {
  totalTransactions: number
  fraudCount: number
  genuineCount: number
  avgFraudScore: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function generateDetailedExplanation(app: AnalyzedTransaction): string {
  const explanationParts: string[] = []

  // External scores analysis
  if (app.extSource2 < 0.3) {
    explanationParts.push(
      `Very low external credit score (EXT_SOURCE_2: ${app.extSource2.toFixed(3)}) indicates significant credit risk and limited positive credit history`,
    )
  } else if (app.extSource2 < 0.5) {
    explanationParts.push(
      `Below average external credit score (EXT_SOURCE_2: ${app.extSource2.toFixed(3)}) suggests moderate credit concerns`,
    )
  }

  if (app.extSource1 < 0.3) {
    explanationParts.push(
      `Low EXT_SOURCE_1 score (${app.extSource1.toFixed(3)}) indicates potential issues with primary credit bureau data`,
    )
  }

  if (app.extSource3 < 0.3) {
    explanationParts.push(
      `Low EXT_SOURCE_3 score (${app.extSource3.toFixed(3)}) reflects concerns from supplementary credit assessment`,
    )
  }

  // Credit to income analysis
  if (app.creditIncomeRatio > 10) {
    explanationParts.push(
      `Extremely high credit-to-income ratio (${app.creditIncomeRatio.toFixed(1)}x) significantly exceeds safe lending limits and indicates severe overextension`,
    )
  } else if (app.creditIncomeRatio > 5) {
    explanationParts.push(
      `High credit-to-income ratio (${app.creditIncomeRatio.toFixed(1)}x) exceeds typical debt capacity thresholds`,
    )
  }

  // Annuity burden
  if (app.annuityIncomeRatio > 0.5) {
    explanationParts.push(
      `Annuity payment consumes ${(app.annuityIncomeRatio * 100).toFixed(0)}% of income, leaving limited capacity for financial emergencies`,
    )
  } else if (app.annuityIncomeRatio > 0.35) {
    explanationParts.push(
      `Annuity burden of ${(app.annuityIncomeRatio * 100).toFixed(0)}% of income is above recommended 35% threshold`,
    )
  }

  // Employment stability
  if (app.employedYears < 1) {
    explanationParts.push(
      `Very short employment history (${app.employedYears.toFixed(1)} years) indicates income instability risk`,
    )
  } else if (app.employedYears < 2) {
    explanationParts.push(
      `Limited employment tenure (${app.employedYears.toFixed(1)} years) may affect repayment stability`,
    )
  }

  // Age factor
  if (app.ageYears < 25) {
    explanationParts.push(
      `Young applicant age (${app.ageYears} years) typically correlates with higher default probability`,
    )
  }

  // Positive factors
  if (app.extSource2 > 0.7) {
    explanationParts.push(
      `Strong external credit score (EXT_SOURCE_2: ${app.extSource2.toFixed(3)}) indicates solid credit history`,
    )
  }
  if (app.employedYears > 10) {
    explanationParts.push(`Long-term employment stability (${app.employedYears.toFixed(0)} years) is a positive factor`)
  }
  if (app.creditIncomeRatio < 3) {
    explanationParts.push(
      `Conservative credit-to-income ratio (${app.creditIncomeRatio.toFixed(1)}x) within safe limits`,
    )
  }

  if (explanationParts.length === 0) {
    return "Standard risk profile with balanced factors across all assessment criteria. No major risk indicators detected."
  }

  return explanationParts.join(". ") + "."
}

export function FraudDetectionModule() {
  const dataStore = useDataStore()
  const [file, setFile] = useState<File | null>(null)
  const [transactions, setTransactions] = useState<Record<string, string | number>[]>([])
  const [analyzedData, setAnalyzedData] = useState<AnalyzedTransaction[]>([])
  const [summary, setSummary] = useState<AnalysisSummary | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<"upload" | "sample" | "kaggle">("upload")
  const [error, setError] = useState<string | null>(null)

  const kaggleDataAvailable = dataStore.dataLoaded && dataStore.applications.length > 0

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      setError(null)
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const { rows } = parseCSV(content)
        setTransactions(rows)
        setAnalyzedData([])
        setSummary(null)
        setDataSource("upload")
      }
      reader.readAsText(uploadedFile)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv"))) {
      setFile(droppedFile)
      setError(null)
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const { rows } = parseCSV(content)
        setTransactions(rows)
        setAnalyzedData([])
        setSummary(null)
        setDataSource("upload")
      }
      reader.readAsText(droppedFile)
    }
  }, [])

  const loadSampleData = () => {
    const sampleData = generateSampleTransactions(25)
    setTransactions(sampleData)
    setFile(null)
    setDataSource("sample")
    setAnalyzedData([])
    setSummary(null)
    setError(null)
  }

  const loadKaggleData = () => {
    if (!kaggleDataAvailable) {
      setError("No Kaggle data loaded. Please load data from the Kaggle Data page first.")
      return
    }

    const transformedData = dataStore.applications.map((app) => ({
      id: `HC-${app.SK_ID_CURR}`,
      SK_ID_CURR: app.SK_ID_CURR,
      AMT_CREDIT: app.AMT_CREDIT,
      AMT_INCOME_TOTAL: app.AMT_INCOME_TOTAL,
      AMT_ANNUITY: app.AMT_ANNUITY,
      NAME_CONTRACT_TYPE: app.NAME_CONTRACT_TYPE,
      NAME_INCOME_TYPE: app.NAME_INCOME_TYPE,
      NAME_HOUSING_TYPE: app.NAME_HOUSING_TYPE,
      EXT_SOURCE_1: app.EXT_SOURCE_1,
      EXT_SOURCE_2: app.EXT_SOURCE_2,
      EXT_SOURCE_3: app.EXT_SOURCE_3,
      CREDIT_INCOME_RATIO: app.CREDIT_INCOME_RATIO,
      ANNUITY_INCOME_RATIO: app.ANNUITY_INCOME_RATIO,
      AGE_YEARS: app.AGE_YEARS,
      EMPLOYED_YEARS: app.EMPLOYED_YEARS,
      RISK_SCORE: app.RISK_SCORE,
      TARGET: app.TARGET,
      CODE_GENDER: app.CODE_GENDER,
      NAME_FAMILY_STATUS: app.NAME_FAMILY_STATUS,
      CNT_CHILDREN: app.CNT_CHILDREN,
      NAME_EDUCATION_TYPE: app.NAME_EDUCATION_TYPE,
      OCCUPATION_TYPE: app.OCCUPATION_TYPE,
      FLAG_OWN_CAR: app.FLAG_OWN_CAR,
      FLAG_OWN_REALTY: app.FLAG_OWN_REALTY,
    }))

    setTransactions(transformedData)
    setFile(null)
    setDataSource("kaggle")
    setAnalyzedData([])
    setSummary(null)
    setError(null)
  }

  const runAnalysis = async () => {
    if (transactions.length === 0) return

    setIsAnalyzing(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const analyzed: AnalyzedTransaction[] = transactions.map((t) => {
        const idStr = String(t.id || t.SK_ID_CURR || Math.random())
        const seed = hashCode(idStr)

        const extSource1 = Number(t.EXT_SOURCE_1) || 0.5
        const extSource2 = Number(t.EXT_SOURCE_2) || 0.5
        const extSource3 = Number(t.EXT_SOURCE_3) || 0.5
        const creditRatio = Number(t.CREDIT_INCOME_RATIO) || 3
        const annuityRatio = Number(t.ANNUITY_INCOME_RATIO) || 0.3
        const employedYears = Number(t.EMPLOYED_YEARS) || 5
        const ageYears = Number(t.AGE_YEARS) || 35
        const riskScore = Number(t.RISK_SCORE) || 50
        const amount = Number(t.AMT_CREDIT) || 0
        const income = Number(t.AMT_INCOME_TOTAL) || 0

        const fraudScore = riskScore / 100
        const riskLevel: "Low" | "Medium" | "High" = fraudScore > 0.6 ? "High" : fraudScore > 0.3 ? "Medium" : "Low"

        const record: AnalyzedTransaction = {
          id: idStr,
          skIdCurr: Number(t.SK_ID_CURR) || 0,
          amount,
          income,
          merchant: String(t.NAME_CONTRACT_TYPE || "N/A"),
          category: String(t.NAME_INCOME_TYPE || "N/A"),
          location: String(t.NAME_HOUSING_TYPE || "N/A"),
          time: new Date().toISOString(),
          fraudScore,
          riskLevel,
          explanation: "",
          flagged: fraudScore > 0.5,
          extSource1,
          extSource2,
          extSource3,
          creditIncomeRatio: creditRatio,
          annuityIncomeRatio: annuityRatio,
          ageYears,
          employedYears,
          gender: String(t.CODE_GENDER || "N/A"),
          familyStatus: String(t.NAME_FAMILY_STATUS || "N/A"),
          children: Number(t.CNT_CHILDREN) || 0,
          education: String(t.NAME_EDUCATION_TYPE || "N/A"),
          housingType: String(t.NAME_HOUSING_TYPE || "N/A"),
          incomeType: String(t.NAME_INCOME_TYPE || "N/A"),
          occupation: String(t.OCCUPATION_TYPE || "N/A"),
          ownCar: String(t.FLAG_OWN_CAR || "N"),
          ownRealty: String(t.FLAG_OWN_REALTY || "N"),
          target: Number(t.TARGET) || 0,
        }

        record.explanation = generateDetailedExplanation(record)

        return record
      })

      const fraudCount = analyzed.filter((t) => t.flagged).length
      const avgScore = analyzed.reduce((sum, t) => sum + t.fraudScore, 0) / analyzed.length

      const newSummary = {
        totalTransactions: analyzed.length,
        fraudCount,
        genuineCount: analyzed.length - fraudCount,
        avgFraudScore: avgScore,
        highRiskCount: analyzed.filter((t) => t.riskLevel === "High").length,
        mediumRiskCount: analyzed.filter((t) => t.riskLevel === "Medium").length,
        lowRiskCount: analyzed.filter((t) => t.riskLevel === "Low").length,
      }

      setSummary(newSummary)
      setAnalyzedData(analyzed)

      dataStore.setAnalysisResults({
        analyzedCount: analyzed.length,
        highRisk: newSummary.highRiskCount,
        mediumRisk: newSummary.mediumRiskCount,
        lowRisk: newSummary.lowRiskCount,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      console.error("Analysis failed:", err)
      setError("Failed to analyze data. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const chartData = summary
    ? [
        { name: "Low Risk", value: summary.lowRiskCount || 0, fill: "#22c55e" },
        { name: "Medium Risk", value: summary.mediumRiskCount || 0, fill: "#f59e0b" },
        { name: "High Risk", value: summary.highRiskCount || 0, fill: "#ef4444" },
      ]
    : []

  const timelineData = (analyzedData || []).slice(0, 15).map((t, i) => ({
    name: `R${i + 1}`,
    score: Math.round((t.fraudScore || 0) * 100),
  }))

  return (
    <div className="p-8">
      <div className="max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Fraud Detection</h1>
            <p className="text-muted-foreground">Analyze Home Credit Default Risk data for fraud patterns</p>
          </div>
        </div>

        {/* Kaggle Data Status */}
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
                    <p className="text-xs text-muted-foreground">Click "Load Kaggle Data" to analyze</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">No Kaggle data loaded</p>
                    <p className="text-xs text-muted-foreground">Load data from the Kaggle Data page first</p>
                  </>
                )}
              </div>
            </div>
            <Link href="/dashboard/kaggle-data">
              <Button variant="outline" size="sm">
                {kaggleDataAvailable ? "Manage Data" : "Load Kaggle Data"}
              </Button>
            </Link>
          </div>
        </Card>

        {/* Expected Columns Info */}
        <Card className="p-4 border border-border mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Expected Columns (Home Credit Format)</p>
              <p className="text-xs text-muted-foreground">
                SK_ID_CURR, AMT_CREDIT, AMT_INCOME_TOTAL, AMT_ANNUITY, EXT_SOURCE_1, EXT_SOURCE_2, EXT_SOURCE_3,
                NAME_CONTRACT_TYPE, NAME_INCOME_TYPE, DAYS_EMPLOYED
              </p>
            </div>
          </div>
        </Card>

        {error && (
          <Card className="p-4 border border-destructive/30 bg-destructive/5 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card
            className="border-2 border-dashed p-8 text-center cursor-pointer transition-all hover:border-primary/50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="fraud-file-input" />
            <label htmlFor="fraud-file-input" className="cursor-pointer block">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {file ? file.name : "Upload Home Credit CSV"}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {file ? `${transactions.length} records loaded` : "Drag and drop or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground">Format: Home Credit Default Risk dataset</p>
            </label>
          </Card>

          <Card className="p-6 border border-border">
            <h3 className="font-semibold text-foreground mb-4">Quick Start</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Load sample data or use Kaggle data from the global store.
            </p>
            <div className="space-y-3">
              <Button onClick={loadSampleData} variant="outline" className="w-full bg-transparent">
                <FileText className="w-4 h-4 mr-2" />
                Load Sample Data
              </Button>
              <Button
                onClick={loadKaggleData}
                variant="outline"
                className="w-full bg-transparent"
                disabled={!kaggleDataAvailable}
              >
                <Database className="w-4 h-4 mr-2" />
                Load Kaggle Data {kaggleDataAvailable && `(${dataStore.recordCount})`}
              </Button>
              <Button
                onClick={runAnalysis}
                disabled={transactions.length === 0 || isAnalyzing}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Run Fraud Detection
                  </>
                )}
              </Button>
            </div>
            {transactions.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Data source:{" "}
                {dataSource === "kaggle"
                  ? `Kaggle Home Credit (${transactions.length} records)`
                  : dataSource === "sample"
                    ? "Sample Data"
                    : "Uploaded CSV"}
              </p>
            )}
          </Card>
        </div>

        {summary && (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card className="p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Total Analyzed</p>
                <p className="text-2xl font-bold text-foreground">{summary.totalTransactions}</p>
              </Card>
              <Card className="p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">High Risk / Flagged</p>
                <p className="text-2xl font-bold text-destructive">{summary.fraudCount}</p>
              </Card>
              <Card className="p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Low Risk</p>
                <p className="text-2xl font-bold text-green-600">{summary.genuineCount}</p>
              </Card>
              <Card className="p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Avg Risk Score</p>
                <p className="text-2xl font-bold text-foreground">{(summary.avgFraudScore * 100).toFixed(1)}%</p>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Risk Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Risk Score by Record</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {analyzedData && analyzedData.length > 0 && (
              <Card className="border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Analysis Results</h3>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">ID</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Credit Amount</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Contract</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Income Type</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Risk Score</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Risk Level</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyzedData.map((record) => (
                        <tr key={record.id} className="border-b border-border">
                          <td colSpan={7} className="p-0">
                            <div
                              className={`flex items-center hover:bg-muted/30 cursor-pointer ${
                                record.flagged ? "bg-destructive/5" : ""
                              }`}
                              onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
                            >
                              <div className="p-3 text-sm text-foreground font-mono flex-1 min-w-[100px]">
                                {record.id}
                              </div>
                              <div className="p-3 text-sm text-foreground flex-1 min-w-[100px]">
                                ${Number(record.amount).toLocaleString()}
                              </div>
                              <div className="p-3 text-sm text-foreground flex-1 min-w-[120px]">{record.merchant}</div>
                              <div className="p-3 text-sm text-foreground capitalize flex-1 min-w-[100px]">
                                {record.category}
                              </div>
                              <div className="p-3 flex-1 min-w-[140px]">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-muted rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        record.fraudScore > 0.6
                                          ? "bg-destructive"
                                          : record.fraudScore > 0.3
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                      }`}
                                      style={{ width: `${record.fraudScore * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-foreground">
                                    {(record.fraudScore * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                              <div className="p-3 flex-1 min-w-[100px]">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                    record.riskLevel === "High"
                                      ? "bg-destructive/10 text-destructive"
                                      : record.riskLevel === "Medium"
                                        ? "bg-yellow-500/10 text-yellow-600"
                                        : "bg-green-500/10 text-green-600"
                                  }`}
                                >
                                  {record.riskLevel === "High" && <AlertTriangle className="w-3 h-3" />}
                                  {record.riskLevel === "Low" && <CheckCircle className="w-3 h-3" />}
                                  {record.riskLevel}
                                </span>
                              </div>
                              <div className="p-3 flex-shrink-0">
                                <Button variant="ghost" size="sm">
                                  {expandedRow === record.id ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            {expandedRow === record.id && (
                              <div className="bg-muted/20 p-6 border-t border-border">
                                <div className="grid md:grid-cols-3 gap-6 mb-6">
                                  {/* Personal Info */}
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-3">
                                      <User className="w-4 h-4 text-primary" />
                                      <p className="text-sm font-medium text-foreground">Personal Info</p>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Gender:</span>
                                        <span className="text-foreground">{record.gender}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Family Status:</span>
                                        <span className="text-foreground">{record.familyStatus}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Children:</span>
                                        <span className="text-foreground">{record.children}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Age:</span>
                                        <span className="text-foreground">{record.ageYears} years</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Education:</span>
                                        <span className="text-foreground">{record.education}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Employment */}
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Briefcase className="w-4 h-4 text-primary" />
                                      <p className="text-sm font-medium text-foreground">Employment</p>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Income Type:</span>
                                        <span className="text-foreground">{record.incomeType}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Occupation:</span>
                                        <span className="text-foreground">{record.occupation}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Employed:</span>
                                        <span className="text-foreground">{record.employedYears.toFixed(1)} years</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Own Car:</span>
                                        <span className="text-foreground">{record.ownCar}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Own Realty:</span>
                                        <span className="text-foreground">{record.ownRealty}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Credit Scores */}
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-3">
                                      <CreditCard className="w-4 h-4 text-primary" />
                                      <p className="text-sm font-medium text-foreground">Credit Scores</p>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">EXT_SOURCE_1:</span>
                                        <span
                                          className={`font-medium ${record.extSource1 < 0.3 ? "text-destructive" : record.extSource1 > 0.6 ? "text-green-600" : "text-foreground"}`}
                                        >
                                          {record.extSource1.toFixed(3)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">EXT_SOURCE_2:</span>
                                        <span
                                          className={`font-medium ${record.extSource2 < 0.3 ? "text-destructive" : record.extSource2 > 0.6 ? "text-green-600" : "text-foreground"}`}
                                        >
                                          {record.extSource2.toFixed(3)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">EXT_SOURCE_3:</span>
                                        <span
                                          className={`font-medium ${record.extSource3 < 0.3 ? "text-destructive" : record.extSource3 > 0.6 ? "text-green-600" : "text-foreground"}`}
                                        >
                                          {record.extSource3.toFixed(3)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Credit/Income:</span>
                                        <span
                                          className={`font-medium ${record.creditIncomeRatio > 5 ? "text-destructive" : "text-foreground"}`}
                                        >
                                          {record.creditIncomeRatio.toFixed(2)}x
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Annuity/Income:</span>
                                        <span
                                          className={`font-medium ${record.annuityIncomeRatio > 0.4 ? "text-destructive" : "text-foreground"}`}
                                        >
                                          {(record.annuityIncomeRatio * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* XAI Risk Analysis */}
                                <div className="border-t border-border pt-4">
                                  <p className="text-sm font-medium text-foreground mb-2">XAI Risk Analysis</p>
                                  <p className="text-sm text-muted-foreground leading-relaxed">{record.explanation}</p>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
