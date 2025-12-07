"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Database,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileSpreadsheet,
  Users,
  Info,
  Check,
  User,
  Briefcase,
  CreditCard,
  Sparkles,
} from "lucide-react"
import {
  generateHomeCreditApplications,
  generateBureauRecords,
  generatePreviousApplications,
  DATASET_STATS,
  FEATURE_IMPORTANCE,
  type HomeCreditApplication,
} from "@/lib/kaggle-data"
import { useDataStore } from "@/lib/data-store"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from "recharts"

type DataTab = "applications" | "bureau" | "previous" | "analysis"

export function KaggleDataModule() {
  const dataStore = useDataStore()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<DataTab>("applications")
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [loadingExplanation, setLoadingExplanation] = useState<number | null>(null)
  const [explanations, setExplanations] = useState<Record<number, string>>({})
  const [sampleSize, setSampleSize] = useState(100)

  const loadKaggleData = async () => {
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const apps = generateHomeCreditApplications(sampleSize)

    const bureau = apps
      .slice(0, 20)
      .flatMap((app) => generateBureauRecords(app.SK_ID_CURR, Math.floor(Math.random() * 5) + 1))

    const prevApps = apps
      .slice(0, 20)
      .flatMap((app) => generatePreviousApplications(app.SK_ID_CURR, Math.floor(Math.random() * 3) + 1))

    dataStore.setKaggleData(apps, bureau, prevApps)
    setIsLoading(false)
  }

  const getAIExplanation = async (app: HomeCreditApplication) => {
    setLoadingExplanation(app.SK_ID_CURR)

    await new Promise((resolve) => setTimeout(resolve, 500))

    const explanationParts: string[] = []

    // External scores analysis
    if (app.EXT_SOURCE_2 < 0.3) {
      explanationParts.push(
        `Very low external credit score (EXT_SOURCE_2: ${app.EXT_SOURCE_2.toFixed(3)}) indicates significant credit risk and limited positive credit history.`,
      )
    } else if (app.EXT_SOURCE_2 < 0.5) {
      explanationParts.push(
        `Below average external credit score (EXT_SOURCE_2: ${app.EXT_SOURCE_2.toFixed(3)}) suggests moderate credit concerns.`,
      )
    } else {
      explanationParts.push(
        `Good external credit score (EXT_SOURCE_2: ${app.EXT_SOURCE_2.toFixed(3)}) indicates solid credit history.`,
      )
    }

    if (app.CREDIT_INCOME_RATIO > 10) {
      explanationParts.push(
        `Extremely high credit-to-income ratio (${app.CREDIT_INCOME_RATIO.toFixed(1)}x) significantly exceeds safe lending limits.`,
      )
    } else if (app.CREDIT_INCOME_RATIO > 5) {
      explanationParts.push(
        `High credit-to-income ratio (${app.CREDIT_INCOME_RATIO.toFixed(1)}x) exceeds typical debt capacity.`,
      )
    } else {
      explanationParts.push(
        `Conservative credit-to-income ratio (${app.CREDIT_INCOME_RATIO.toFixed(1)}x) within safe limits.`,
      )
    }

    if (app.EMPLOYED_YEARS < 1) {
      explanationParts.push(
        `Very short employment history (${app.EMPLOYED_YEARS.toFixed(1)} years) indicates income instability risk.`,
      )
    } else if (app.EMPLOYED_YEARS > 5) {
      explanationParts.push(`Stable employment history (${app.EMPLOYED_YEARS.toFixed(1)} years) is a positive factor.`)
    }

    if (app.TARGET === 1) {
      explanationParts.push(`This applicant has a recorded default in the dataset, confirming the risk assessment.`)
    }

    setExplanations((prev) => ({ ...prev, [app.SK_ID_CURR]: explanationParts.join(" ") }))
    setLoadingExplanation(null)
  }

  const applications = dataStore.applications
  const bureauRecords = dataStore.bureauRecords
  const previousApps = dataStore.previousApps

  const stats =
    applications.length > 0
      ? {
          totalApps: applications.length,
          defaultRate: ((applications.filter((a) => a.TARGET === 1).length / applications.length) * 100).toFixed(2),
          avgIncome: Math.round(applications.reduce((sum, a) => sum + a.AMT_INCOME_TOTAL, 0) / applications.length),
          avgCredit: Math.round(applications.reduce((sum, a) => sum + a.AMT_CREDIT, 0) / applications.length),
          highRisk: applications.filter((a) => a.RISK_LEVEL === "High").length,
          mediumRisk: applications.filter((a) => a.RISK_LEVEL === "Medium").length,
          lowRisk: applications.filter((a) => a.RISK_LEVEL === "Low").length,
        }
      : null

  const riskDistribution = stats
    ? [
        { name: "Low Risk", value: stats.lowRisk, fill: "#22c55e" },
        { name: "Medium Risk", value: stats.mediumRisk, fill: "#f59e0b" },
        { name: "High Risk", value: stats.highRisk, fill: "#ef4444" },
      ]
    : []

  const incomeDistribution =
    applications.length > 0
      ? [
          { range: "<50K", count: applications.filter((a) => a.AMT_INCOME_TOTAL < 50000).length },
          {
            range: "50-100K",
            count: applications.filter((a) => a.AMT_INCOME_TOTAL >= 50000 && a.AMT_INCOME_TOTAL < 100000).length,
          },
          {
            range: "100-200K",
            count: applications.filter((a) => a.AMT_INCOME_TOTAL >= 100000 && a.AMT_INCOME_TOTAL < 200000).length,
          },
          {
            range: "200-300K",
            count: applications.filter((a) => a.AMT_INCOME_TOTAL >= 200000 && a.AMT_INCOME_TOTAL < 300000).length,
          },
          { range: ">300K", count: applications.filter((a) => a.AMT_INCOME_TOTAL >= 300000).length },
        ]
      : []

  return (
    <div className="p-8">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Kaggle Data Source</h1>
            <p className="text-muted-foreground">
              Home Credit Default Risk Dataset - Load directly without file upload
            </p>
          </div>
          <a
            href="https://www.kaggle.com/competitions/home-credit-default-risk/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            View on Kaggle
          </a>
        </div>

        {/* Data Status Banner */}
        {dataStore.dataLoaded && (
          <Card className="p-4 border border-green-500/30 bg-green-500/5 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">Data Loaded: {dataStore.recordCount} records</p>
                  <p className="text-xs text-muted-foreground">
                    Available in Fraud Detection, Credit Scoring, and Simulation modules. Data persists across page
                    navigation.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => dataStore.clearData()}>
                Clear Data
              </Button>
            </div>
          </Card>
        )}

        {/* Dataset Info Card */}
        <Card className="p-6 border border-border mb-8 bg-muted/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">Home Credit Default Risk Competition</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This dataset contains loan application data from Home Credit, a service dedicated to provided lines of
                credit to the unbanked population. The goal is to predict which clients will have difficulty repaying
                their loans.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Applications</p>
                  <p className="font-semibold text-foreground">{DATASET_STATS.totalApplications.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Default Rate</p>
                  <p className="font-semibold text-foreground">{(DATASET_STATS.defaultRate * 100).toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Income</p>
                  <p className="font-semibold text-foreground">${DATASET_STATS.avgIncome.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Credit</p>
                  <p className="font-semibold text-foreground">${DATASET_STATS.avgCredit.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Expected Columns Info */}
        <Card className="p-6 border border-border mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Expected Dataset Columns (Home Credit Format)</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium text-foreground">Identification</p>
              <p className="text-muted-foreground">SK_ID_CURR, TARGET</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Financial</p>
              <p className="text-muted-foreground">AMT_INCOME_TOTAL, AMT_CREDIT, AMT_ANNUITY, AMT_GOODS_PRICE</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Demographics</p>
              <p className="text-muted-foreground">CODE_GENDER, CNT_CHILDREN, NAME_FAMILY_STATUS</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Employment</p>
              <p className="text-muted-foreground">NAME_INCOME_TYPE, OCCUPATION_TYPE, DAYS_EMPLOYED</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">External Scores</p>
              <p className="text-muted-foreground">EXT_SOURCE_1, EXT_SOURCE_2, EXT_SOURCE_3</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Assets</p>
              <p className="text-muted-foreground">FLAG_OWN_CAR, FLAG_OWN_REALTY, NAME_HOUSING_TYPE</p>
            </div>
          </div>
        </Card>

        {/* Load Data Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Sample Size</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Select how many records to load for analysis</p>
            <select
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-full p-2 border border-border rounded-lg bg-background text-foreground mb-4"
            >
              <option value={50}>50 records</option>
              <option value={100}>100 records</option>
              <option value={250}>250 records</option>
              <option value={500}>500 records</option>
              <option value={1000}>1,000 records</option>
            </select>
            <Button
              onClick={loadKaggleData}
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading Data...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Load from Kaggle
                </>
              )}
            </Button>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Dataset Tables</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">application_train.csv</span>
                <span className="text-foreground font-medium">{applications.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">bureau.csv</span>
                <span className="text-foreground font-medium">{bureauRecords.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">previous_application.csv</span>
                <span className="text-foreground font-medium">{previousApps.length}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Top Features</h3>
            </div>
            <div className="space-y-2">
              {FEATURE_IMPORTANCE.slice(0, 5).map((f) => (
                <div key={f.feature} className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${f.importance * 600}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground truncate flex-1">{f.feature}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Results Section */}
        {applications.length > 0 && (
          <>
            {/* Summary Stats */}
            <div className="grid md:grid-cols-5 gap-4 mb-8">
              <Card className="p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Total Loaded</p>
                <p className="text-2xl font-bold text-foreground">{stats?.totalApps}</p>
              </Card>
              <Card className="p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Default Rate</p>
                <p className="text-2xl font-bold text-destructive">{stats?.defaultRate}%</p>
              </Card>
              <Card className="p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Avg Income</p>
                <p className="text-2xl font-bold text-foreground">${stats?.avgIncome.toLocaleString()}</p>
              </Card>
              <Card className="p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Avg Credit</p>
                <p className="text-2xl font-bold text-foreground">${stats?.avgCredit.toLocaleString()}</p>
              </Card>
              <Card className="p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">High Risk</p>
                <p className="text-2xl font-bold text-destructive">{stats?.highRisk}</p>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Risk Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Income Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={incomeDistribution}>
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

            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-border">
              {(["applications", "bureau", "previous", "analysis"] as DataTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "applications" && "Applications"}
                  {tab === "bureau" && "Bureau Records"}
                  {tab === "previous" && "Previous Apps"}
                  {tab === "analysis" && "AI Analysis"}
                </button>
              ))}
            </div>

            {/* Applications Table */}
            {activeTab === "applications" && (
              <Card className="border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Application Data ({applications.length})</h3>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">SK_ID_CURR</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Contract</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">AMT_INCOME</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">AMT_CREDIT</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">AGE</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Risk Score</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">TARGET</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 50).map((app) => (
                        <React.Fragment key={app.SK_ID_CURR}>
                          <tr
                            className={`border-b border-border hover:bg-muted/30 cursor-pointer ${
                              app.TARGET === 1 ? "bg-destructive/5" : ""
                            }`}
                            onClick={() => setExpandedRow(expandedRow === app.SK_ID_CURR ? null : app.SK_ID_CURR)}
                          >
                            <td className="p-3 text-sm text-foreground font-mono">{app.SK_ID_CURR}</td>
                            <td className="p-3 text-sm text-foreground">{app.NAME_CONTRACT_TYPE}</td>
                            <td className="p-3 text-sm text-foreground">${app.AMT_INCOME_TOTAL.toLocaleString()}</td>
                            <td className="p-3 text-sm text-foreground">${app.AMT_CREDIT.toLocaleString()}</td>
                            <td className="p-3 text-sm text-foreground">{app.AGE_YEARS} yrs</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-muted rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      app.RISK_SCORE > 60
                                        ? "bg-destructive"
                                        : app.RISK_SCORE > 30
                                          ? "bg-yellow-500"
                                          : "bg-green-500"
                                    }`}
                                    style={{ width: `${app.RISK_SCORE}%` }}
                                  />
                                </div>
                                <span className="text-sm text-foreground">{app.RISK_SCORE}%</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  app.TARGET === 1
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-green-500/10 text-green-600"
                                }`}
                              >
                                {app.TARGET === 1 ? (
                                  <>
                                    <AlertTriangle className="w-3 h-3" />
                                    Default
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    No Default
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="p-3">
                              <Button variant="ghost" size="sm">
                                {expandedRow === app.SK_ID_CURR ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            </td>
                          </tr>
                          {expandedRow === app.SK_ID_CURR && (
                            <tr key={`${app.SK_ID_CURR}-expanded`}>
                              <td colSpan={8} className="p-0">
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
                                          <span className="text-foreground">{app.CODE_GENDER}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Family Status:</span>
                                          <span className="text-foreground">{app.NAME_FAMILY_STATUS}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Children:</span>
                                          <span className="text-foreground">{app.CNT_CHILDREN}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Education:</span>
                                          <span className="text-foreground">{app.NAME_EDUCATION_TYPE}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Housing:</span>
                                          <span className="text-foreground">{app.NAME_HOUSING_TYPE}</span>
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
                                          <span className="text-foreground">{app.NAME_INCOME_TYPE}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Occupation:</span>
                                          <span className="text-foreground">{app.OCCUPATION_TYPE}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Employed:</span>
                                          <span className="text-foreground">{app.EMPLOYED_YEARS.toFixed(1)} years</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Own Car:</span>
                                          <span className="text-foreground">{app.FLAG_OWN_CAR}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Own Realty:</span>
                                          <span className="text-foreground">{app.FLAG_OWN_REALTY}</span>
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
                                            className={`font-medium ${app.EXT_SOURCE_1 < 0.3 ? "text-destructive" : app.EXT_SOURCE_1 > 0.6 ? "text-green-600" : "text-foreground"}`}
                                          >
                                            {app.EXT_SOURCE_1.toFixed(3)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">EXT_SOURCE_2:</span>
                                          <span
                                            className={`font-medium ${app.EXT_SOURCE_2 < 0.3 ? "text-destructive" : app.EXT_SOURCE_2 > 0.6 ? "text-green-600" : "text-foreground"}`}
                                          >
                                            {app.EXT_SOURCE_2.toFixed(3)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">EXT_SOURCE_3:</span>
                                          <span
                                            className={`font-medium ${app.EXT_SOURCE_3 < 0.3 ? "text-destructive" : app.EXT_SOURCE_3 > 0.6 ? "text-green-600" : "text-foreground"}`}
                                          >
                                            {app.EXT_SOURCE_3.toFixed(3)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Credit/Income:</span>
                                          <span
                                            className={`font-medium ${app.CREDIT_INCOME_RATIO > 5 ? "text-destructive" : "text-foreground"}`}
                                          >
                                            {app.CREDIT_INCOME_RATIO.toFixed(2)}x
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Annuity/Income:</span>
                                          <span
                                            className={`font-medium ${app.ANNUITY_INCOME_RATIO > 0.4 ? "text-destructive" : "text-foreground"}`}
                                          >
                                            {(app.ANNUITY_INCOME_RATIO * 100).toFixed(1)}%
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* AI Risk Explanation */}
                                  <div className="border-t border-border pt-4">
                                    <p className="text-sm font-medium text-foreground mb-2">AI Risk Explanation</p>
                                    {explanations[app.SK_ID_CURR] ? (
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {explanations[app.SK_ID_CURR]}
                                      </p>
                                    ) : (
                                      <div className="flex items-center gap-3">
                                        <p className="text-sm text-muted-foreground">
                                          Click 'Get AI Analysis' to generate an explanation for this applicant's risk
                                          profile
                                        </p>
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            getAIExplanation(app)
                                          }}
                                          disabled={loadingExplanation === app.SK_ID_CURR}
                                        >
                                          {loadingExplanation === app.SK_ID_CURR ? (
                                            <>
                                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                              Analyzing...
                                            </>
                                          ) : (
                                            <>
                                              <Sparkles className="w-3 h-3 mr-1" />
                                              Get AI Analysis
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    )}
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
            )}

            {/* Bureau Records Table */}
            {activeTab === "bureau" && (
              <Card className="border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Bureau Records ({bureauRecords.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">SK_ID_BUREAU</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">SK_ID_CURR</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Credit Type</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">AMT_CREDIT_SUM</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">AMT_DEBT</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Days Overdue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bureauRecords.slice(0, 30).map((record) => (
                        <tr key={record.SK_ID_BUREAU} className="border-b border-border hover:bg-muted/30">
                          <td className="p-3 text-sm text-foreground font-mono">{record.SK_ID_BUREAU}</td>
                          <td className="p-3 text-sm text-foreground">{record.SK_ID_CURR}</td>
                          <td className="p-3 text-sm text-foreground">{record.CREDIT_TYPE}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                record.CREDIT_ACTIVE === "Active"
                                  ? "bg-blue-500/10 text-blue-600"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {record.CREDIT_ACTIVE}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-foreground">${record.AMT_CREDIT_SUM.toLocaleString()}</td>
                          <td className="p-3 text-sm text-foreground">
                            ${record.AMT_CREDIT_SUM_DEBT.toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-sm ${record.CREDIT_DAY_OVERDUE > 0 ? "text-destructive font-medium" : "text-foreground"}`}
                            >
                              {record.CREDIT_DAY_OVERDUE}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Previous Applications Table */}
            {activeTab === "previous" && (
              <Card className="border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Previous Applications ({previousApps.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">SK_ID_PREV</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">SK_ID_CURR</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Contract Type</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">AMT_APPLICATION</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Client Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previousApps.slice(0, 30).map((app) => (
                        <tr key={app.SK_ID_PREV} className="border-b border-border hover:bg-muted/30">
                          <td className="p-3 text-sm text-foreground font-mono">{app.SK_ID_PREV}</td>
                          <td className="p-3 text-sm text-foreground">{app.SK_ID_CURR}</td>
                          <td className="p-3 text-sm text-foreground">{app.NAME_CONTRACT_TYPE}</td>
                          <td className="p-3 text-sm text-foreground">${app.AMT_APPLICATION.toLocaleString()}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                app.NAME_CONTRACT_STATUS === "Approved"
                                  ? "bg-green-500/10 text-green-600"
                                  : app.NAME_CONTRACT_STATUS === "Refused"
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {app.NAME_CONTRACT_STATUS}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-foreground">{app.NAME_CLIENT_TYPE}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* AI Analysis Tab */}
            {activeTab === "analysis" && (
              <Card className="border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">AI-Powered Risk Analysis</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Click on any application in the Applications tab to get detailed AI explanations for the risk
                  assessment.
                </p>
                <div className="space-y-4">
                  {FEATURE_IMPORTANCE.map((feature) => (
                    <div key={feature.feature} className="flex items-center gap-4">
                      <div className="w-40 text-sm font-medium text-foreground truncate">{feature.feature}</div>
                      <div className="flex-1 bg-muted rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-primary"
                          style={{ width: `${feature.importance * 100 * 6}%` }}
                        />
                      </div>
                      <div className="w-16 text-sm text-muted-foreground text-right">
                        {(feature.importance * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
