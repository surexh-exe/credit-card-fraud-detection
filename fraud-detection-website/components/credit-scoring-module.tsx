"use client"

import React, { useState, useCallback } from "react"
import type { FC } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Upload,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Database,
  Info,
  User,
  Briefcase,
  CreditCard,
} from "lucide-react"
import { parseCSV, generateSampleApplicants } from "@/lib/csv-parser"
import { useDataStore } from "@/lib/data-store"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import Link from "next/link"

interface FeatureImportance {
  feature: string
  importance: number
  impact: "positive" | "negative" | "neutral"
}

interface ScoredApplicant {
  id: string
  skIdCurr: number
  income: number
  loanAmount: number
  employmentLength: number
  creditHistory: number
  debtToIncome: number
  creditScore: number
  riskGroup: "Prime" | "Near-prime" | "Subprime"
  featureImportance: FeatureImportance[]
  explanation: string
  approved: boolean
  // Home Credit specific fields
  extSource1: number
  extSource2: number
  extSource3: number
  creditIncomeRatio: number
  annuityIncomeRatio: number
  ageYears: number
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
  [key: string]: string | number | boolean | FeatureImportance[]
}

interface Distribution {
  prime: number
  nearPrime: number
  subprime: number
  avgScore: number
  approvalRate: number
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

export function CreditScoringModule() {
  const dataStore = useDataStore()
  const [file, setFile] = useState<File | null>(null)
  const [applicants, setApplicants] = useState<Record<string, string | number>[]>([])
  const [scoredData, setScoredData] = useState<ScoredApplicant[]>([])
  const [distribution, setDistribution] = useState<Distribution | null>(null)
  const [isScoring, setIsScoring] = useState(false)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<"upload" | "sample" | "kaggle">("upload")

  const kaggleDataAvailable = dataStore.dataLoaded && dataStore.applications.length > 0

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const { rows } = parseCSV(content)
        setApplicants(rows)
        setScoredData([])
        setDistribution(null)
      }
      reader.readAsText(uploadedFile)
    }
  }, [])

  const loadSampleData = () => {
    const sampleData = generateSampleApplicants(20)
    setApplicants(sampleData)
    setFile(null)
    setDataSource("sample")
    setScoredData([])
    setDistribution(null)
  }

  const loadKaggleData = () => {
    if (!kaggleDataAvailable) return

    const transformedData = dataStore.applications.map((app) => ({
      id: `HC-${app.SK_ID_CURR}`,
      SK_ID_CURR: app.SK_ID_CURR,
      income: app.AMT_INCOME_TOTAL,
      loanAmount: app.AMT_CREDIT,
      employmentLength: app.EMPLOYED_YEARS,
      creditHistory: Math.round(300 + app.EXT_SOURCE_2 * 550),
      debtToIncome: app.ANNUITY_INCOME_RATIO,
      extSource1: app.EXT_SOURCE_1,
      extSource2: app.EXT_SOURCE_2,
      extSource3: app.EXT_SOURCE_3,
      creditIncomeRatio: app.CREDIT_INCOME_RATIO,
      annuityIncomeRatio: app.ANNUITY_INCOME_RATIO,
      ageYears: app.AGE_YEARS,
      riskScore: app.RISK_SCORE,
      target: app.TARGET,
      CODE_GENDER: app.CODE_GENDER,
      NAME_FAMILY_STATUS: app.NAME_FAMILY_STATUS,
      CNT_CHILDREN: app.CNT_CHILDREN,
      NAME_EDUCATION_TYPE: app.NAME_EDUCATION_TYPE,
      NAME_HOUSING_TYPE: app.NAME_HOUSING_TYPE,
      NAME_INCOME_TYPE: app.NAME_INCOME_TYPE,
      OCCUPATION_TYPE: app.OCCUPATION_TYPE,
      FLAG_OWN_CAR: app.FLAG_OWN_CAR,
      FLAG_OWN_REALTY: app.FLAG_OWN_REALTY,
    }))

    setApplicants(transformedData)
    setFile(null)
    setDataSource("kaggle")
    setScoredData([])
    setDistribution(null)
  }

  const runScoring = async () => {
    if (applicants.length === 0) return

    setIsScoring(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const scored: ScoredApplicant[] = applicants.map((a) => {
      const idStr = String(a.id || a.SK_ID_CURR || Math.random())
      const seed = hashCode(idStr)

      const income = Number(a.income) || 100000
      const loanAmount = Number(a.loanAmount) || 200000
      const employmentLength = Number(a.employmentLength) || 3
      const extSource1 = Number(a.extSource1) || 0.5
      const extSource2 = Number(a.extSource2) || 0.5
      const extSource3 = Number(a.extSource3) || 0.5
      const debtToIncome = Number(a.debtToIncome) || 0.3
      const creditIncomeRatio = Number(a.creditIncomeRatio) || loanAmount / income
      const annuityIncomeRatio = Number(a.annuityIncomeRatio) || 0.3
      const ageYears = Number(a.ageYears) || 35

      // Calculate deterministic credit score based on features
      let baseScore = 550
      baseScore += extSource1 * 100
      baseScore += extSource2 * 100
      baseScore += extSource3 * 100
      baseScore += Math.min(employmentLength * 5, 50)
      baseScore -= debtToIncome * 100
      baseScore -= loanAmount / income > 5 ? 50 : 0

      const creditScore = Math.max(300, Math.min(850, Math.round(baseScore)))

      const riskGroup: "Prime" | "Near-prime" | "Subprime" =
        creditScore >= 700 ? "Prime" : creditScore >= 600 ? "Near-prime" : "Subprime"

      const approved = creditScore >= 600

      // Feature importance
      const featureImportance: FeatureImportance[] = [
        {
          feature: "EXT_SOURCE_2",
          importance: Math.round(extSource2 * 100),
          impact: extSource2 > 0.5 ? "positive" : "negative",
        },
        {
          feature: "EXT_SOURCE_3",
          importance: Math.round(extSource3 * 100),
          impact: extSource3 > 0.5 ? "positive" : "negative",
        },
        {
          feature: "Employment Years",
          importance: Math.min(employmentLength * 10, 100),
          impact: employmentLength > 2 ? "positive" : "negative",
        },
        {
          feature: "Debt-to-Income",
          importance: Math.round(debtToIncome * 100),
          impact: debtToIncome < 0.4 ? "positive" : "negative",
        },
        {
          feature: "Credit-to-Income Ratio",
          importance: Math.round((loanAmount / income) * 20),
          impact: loanAmount / income < 4 ? "positive" : "negative",
        },
      ]

      // Generate explanation
      const explanationParts: string[] = []
      
      // Credit score assessment
      if (creditScore >= 750) {
        explanationParts.push(`Excellent credit profile with a score of ${creditScore}. Applicant qualifies as Prime tier with strong lending credentials.`)
      } else if (creditScore >= 700) {
        explanationParts.push(`Good credit score of ${creditScore} places applicant in Prime tier. Strong financial history indicates low default risk.`)
      } else if (creditScore >= 600) {
        explanationParts.push(`Fair credit score of ${creditScore} places applicant in Near-prime tier. Moderate risk with caution recommended.`)
      } else {
        explanationParts.push(`Low credit score of ${creditScore} indicates Subprime tier. High default risk - approval not recommended.`)
      }

      // External source analysis
      if (extSource2 > 0.7) {
        explanationParts.push("Strong external credit bureau evaluation (EXT_SOURCE_2) demonstrates excellent creditworthiness from third-party sources.")
      } else if (extSource2 > 0.5) {
        explanationParts.push("Moderate external credit bureau score indicates acceptable credit history from third-party sources.")
      } else if (extSource2 < 0.3) {
        explanationParts.push("Weak external credit bureau evaluation indicates credit challenges or limited credit history, increasing risk assessment.")
      }

      // Employment stability
      if (employmentLength > 5) {
        explanationParts.push(`Stable employment history of ${employmentLength.toFixed(1)} years demonstrates income reliability and reduced unemployment risk.`)
      } else if (employmentLength > 2) {
        explanationParts.push(`Moderate employment tenure of ${employmentLength.toFixed(1)} years shows reasonable job stability.`)
      } else if (employmentLength > 0) {
        explanationParts.push(`Short employment history of ${employmentLength.toFixed(1)} years is a risk factor - less time to demonstrate consistent income.`)
      }

      // Debt-to-income analysis
      const dtiPercent = (debtToIncome * 100).toFixed(1)
      if (debtToIncome < 0.25) {
        explanationParts.push(`Excellent debt-to-income ratio of ${dtiPercent}% indicates strong repayment capacity with manageable obligations.`)
      } else if (debtToIncome < 0.4) {
        explanationParts.push(`Acceptable debt-to-income ratio of ${dtiPercent}% suggests moderate financial obligations with reasonable repayment capability.`)
      } else if (debtToIncome < 0.5) {
        explanationParts.push(`High debt-to-income ratio of ${dtiPercent}% indicates limited capacity to take on additional credit obligations.`)
      } else {
        explanationParts.push(`Very high debt-to-income ratio of ${dtiPercent}% significantly limits borrowing capacity and increases default risk.`)
      }

      // Loan-to-income ratio analysis
      const creditIncomePercent = ((loanAmount / income) * 100).toFixed(1)
      if (loanAmount / income < 2) {
        explanationParts.push(`Favorable loan-to-income ratio of ${creditIncomePercent}% indicates the credit amount is conservative relative to income.`)
      } else if (loanAmount / income < 4) {
        explanationParts.push(`Moderate loan-to-income ratio of ${creditIncomePercent}% is within acceptable lending guidelines.`)
      } else if (loanAmount / income < 6) {
        explanationParts.push(`High loan-to-income ratio of ${creditIncomePercent}% suggests the credit request is substantial relative to income, increasing risk.`)
      } else {
        explanationParts.push(`Excessive loan-to-income ratio of ${creditIncomePercent}% indicates the credit amount far exceeds recommended thresholds - high default risk.`)
      }

      // Final decision
      if (creditScore >= 700) {
        explanationParts.push("Overall Assessment: Strong financial profile supports loan approval with competitive terms.")
      } else if (creditScore >= 600) {
        explanationParts.push("Overall Assessment: Moderate risk profile - conditional approval recommended with higher interest rates or lower credit limits.")
      } else {
        explanationParts.push("Overall Assessment: Weak financial metrics recommend loan denial or alternative products like secured credit.")
      }

      return {
        id: idStr,
        skIdCurr: Number(a.SK_ID_CURR) || 0,
        income,
        loanAmount,
        employmentLength,
        creditHistory: Number(a.creditHistory) || 650,
        debtToIncome,
        creditScore,
        riskGroup,
        featureImportance,
        explanation: explanationParts.join(" "),
        approved,
        extSource1,
        extSource2,
        extSource3,
        creditIncomeRatio,
        annuityIncomeRatio,
        ageYears,
        gender: String(a.CODE_GENDER || "N/A"),
        familyStatus: String(a.NAME_FAMILY_STATUS || "N/A"),
        children: Number(a.CNT_CHILDREN) || 0,
        education: String(a.NAME_EDUCATION_TYPE || "N/A"),
        housingType: String(a.NAME_HOUSING_TYPE || "N/A"),
        incomeType: String(a.NAME_INCOME_TYPE || "N/A"),
        occupation: String(a.OCCUPATION_TYPE || "N/A"),
        ownCar: String(a.FLAG_OWN_CAR || "N"),
        ownRealty: String(a.FLAG_OWN_REALTY || "N"),
        target: Number(a.target) || 0,
      }
    })

    const prime = scored.filter((a) => a.riskGroup === "Prime").length
    const nearPrime = scored.filter((a) => a.riskGroup === "Near-prime").length
    const subprime = scored.filter((a) => a.riskGroup === "Subprime").length
    const avgScore = scored.reduce((sum, a) => sum + a.creditScore, 0) / scored.length
    const approvalRate = (scored.filter((a) => a.approved).length / scored.length) * 100

    setScoredData(scored)
    setDistribution({ prime, nearPrime, subprime, avgScore, approvalRate })
    setIsScoring(false)
  }

  const pieData = distribution
    ? [
        { name: "Prime", value: distribution.prime, fill: "#22c55e" },
        { name: "Near-prime", value: distribution.nearPrime, fill: "#f59e0b" },
        { name: "Subprime", value: distribution.subprime, fill: "#ef4444" },
      ]
    : []

  const scoreDistribution =
    scoredData.length > 0
      ? [
          { range: "300-499", count: scoredData.filter((a) => a.creditScore < 500).length },
          { range: "500-599", count: scoredData.filter((a) => a.creditScore >= 500 && a.creditScore < 600).length },
          { range: "600-699", count: scoredData.filter((a) => a.creditScore >= 600 && a.creditScore < 700).length },
          { range: "700-799", count: scoredData.filter((a) => a.creditScore >= 700 && a.creditScore < 800).length },
          { range: "800-850", count: scoredData.filter((a) => a.creditScore >= 800).length },
        ]
      : []

  return (
    <div className="p-8">
      <div className="max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Credit Scoring</h1>
            <p className="text-muted-foreground">Credit risk assessment using Home Credit Default Risk features</p>
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
                    <p className="text-xs text-muted-foreground">Click "Load Kaggle Data" to score applicants</p>
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
                SK_ID_CURR, AMT_INCOME_TOTAL, AMT_CREDIT, DAYS_EMPLOYED, EXT_SOURCE_1, EXT_SOURCE_2, EXT_SOURCE_3,
                AMT_ANNUITY, NAME_INCOME_TYPE, OCCUPATION_TYPE
              </p>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card
            className="border-2 border-dashed p-8 text-center cursor-pointer transition-all hover:border-primary/50"
            onDragOver={(e) => e.preventDefault()}
          >
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="credit-file-input" />
            <label htmlFor="credit-file-input" className="cursor-pointer block">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {file ? file.name : "Upload Applicant CSV"}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {file ? `${applicants.length} applicants loaded` : "Drag and drop or click to browse"}
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
                onClick={runScoring}
                disabled={applicants.length === 0 || isScoring}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isScoring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scoring...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Score Applicants
                  </>
                )}
              </Button>
            </div>
            {applicants.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Data source:{" "}
                {dataSource === "kaggle"
                  ? `Kaggle Home Credit (${applicants.length} records)`
                  : dataSource === "sample"
                    ? "Sample Data"
                    : "Uploaded CSV"}
              </p>
            )}
          </Card>
        </div>

        {distribution && (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card className="p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Total Applicants</p>
                <p className="text-2xl font-bold text-foreground">{scoredData.length}</p>
              </Card>
              <Card className="p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                <p className="text-2xl font-bold text-foreground">{Math.round(distribution.avgScore)}</p>
              </Card>
              <Card className="p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Approval Rate</p>
                <p className="text-2xl font-bold text-green-600">{distribution.approvalRate.toFixed(1)}%</p>
              </Card>
              <Card className="p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">High Risk (Subprime)</p>
                <p className="text-2xl font-bold text-destructive">{distribution.subprime}</p>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Risk Group Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Credit Score Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Applicant Results</h3>
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
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Income</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Loan Amount</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Credit Score</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Risk Group</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Decision</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoredData.map((applicant) => (
                      <React.Fragment key={applicant.id}>
                        <tr 
                          className={`border-b border-border hover:bg-muted/30 cursor-pointer ${
                            applicant.approved ? "" : "bg-destructive/5"
                          }`}
                          onClick={() => setExpandedRow(expandedRow === applicant.id ? null : applicant.id)}
                        >
                          <td className="p-3 text-sm text-foreground font-mono">{applicant.id}</td>
                          <td className="p-3 text-sm text-foreground">${Number(applicant.income).toLocaleString()}</td>
                          <td className="p-3 text-sm text-foreground">
                            ${Number(applicant.loanAmount).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-lg font-bold ${
                                applicant.creditScore >= 700
                                  ? "text-green-600"
                                  : applicant.creditScore >= 600
                                    ? "text-yellow-600"
                                    : "text-destructive"
                              }`}
                            >
                              {applicant.creditScore}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                applicant.riskGroup === "Prime"
                                  ? "bg-green-500/10 text-green-600"
                                  : applicant.riskGroup === "Near-prime"
                                    ? "bg-yellow-500/10 text-yellow-600"
                                    : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {applicant.riskGroup}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                applicant.approved
                                  ? "bg-green-500/10 text-green-600"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {applicant.approved ? "Approved" : "Declined"}
                            </span>
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedRow(expandedRow === applicant.id ? null : applicant.id)
                              }}
                            >
                              {expandedRow === applicant.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </td>
                        </tr>
                        {expandedRow === applicant.id && (
                          <tr>
                            <td colSpan={7} className="p-0">
                              <div className="bg-muted/20 p-6 border-t border-border">
                                <div className="grid md:grid-cols-4 gap-6 mb-6">
                                  {/* Personal Info */}
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-3">
                                      <User className="w-4 h-4 text-primary" />
                                      <p className="text-sm font-medium text-foreground">Personal Info</p>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Gender:</span>
                                        <span className="text-foreground">{applicant.gender}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Family Status:</span>
                                        <span className="text-foreground">{applicant.familyStatus}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Children:</span>
                                        <span className="text-foreground">{applicant.children}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Education:</span>
                                        <span className="text-foreground">{applicant.education}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Housing:</span>
                                        <span className="text-foreground">{applicant.housingType}</span>
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
                                        <span className="text-foreground">{applicant.incomeType}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Occupation:</span>
                                        <span className="text-foreground">{applicant.occupation}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Employed:</span>
                                        <span className="text-foreground">{applicant.employmentLength.toFixed(1)} years</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Own Car:</span>
                                        <span className="text-foreground">{applicant.ownCar}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Own Realty:</span>
                                        <span className="text-foreground">{applicant.ownRealty}</span>
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
                                        <span className="text-foreground">{applicant.extSource1.toFixed(3)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">EXT_SOURCE_2:</span>
                                        <span className="text-foreground">{applicant.extSource2.toFixed(3)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">EXT_SOURCE_3:</span>
                                        <span className="text-foreground">{applicant.extSource3.toFixed(3)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Credit/Income:</span>
                                        <span className="text-foreground">{applicant.creditIncomeRatio.toFixed(2)}x</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Annuity/Income:</span>
                                        <span className="text-foreground">
                                          {(applicant.annuityIncomeRatio * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Feature Importance */}
                                  <div className="space-y-3">
                                    <p className="text-sm font-medium text-foreground mb-3">Feature Importance (SHAP-style)</p>
                                    <div className="space-y-2">
                                      {applicant.featureImportance.map((feature) => (
                                        <div key={feature.feature} className="flex items-center gap-2">
                                          {feature.impact === "positive" ? (
                                            <TrendingUp className="w-3 h-3 text-green-600" />
                                          ) : feature.impact === "negative" ? (
                                            <TrendingDown className="w-3 h-3 text-destructive" />
                                          ) : (
                                            <Minus className="w-3 h-3 text-muted-foreground" />
                                          )}
                                          <span className="text-xs text-foreground flex-1 truncate">{feature.feature}</span>
                                          <div className="w-12 bg-muted rounded-full h-1.5">
                                            <div
                                              className={`h-1.5 rounded-full ${
                                                feature.impact === "positive"
                                                  ? "bg-green-500"
                                                  : feature.impact === "negative"
                                                    ? "bg-destructive"
                                                    : "bg-muted-foreground"
                                              }`}
                                              style={{ width: `${Math.min(feature.importance, 100)}%` }}
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* XAI Explanation */}
                                <div className="border-t border-border pt-4">
                                  <p className="text-sm font-medium text-foreground mb-2">XAI Explanation</p>
                                  <p className="text-sm text-muted-foreground">{applicant.explanation}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
