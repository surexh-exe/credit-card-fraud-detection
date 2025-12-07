"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, Database, AlertTriangle } from "lucide-react"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { useDataStore } from "@/lib/data-store"
import { useMemo } from "react"

export function InsightsContent() {
  const { dataLoaded, applications, recordCount, loadedAt } = useDataStore()

  const insights = useMemo(() => {
    if (!dataLoaded || applications.length === 0) return null

    // Default vs Non-Default distribution
    const defaultCount = applications.filter((a) => a.TARGET === 1).length
    const nonDefaultCount = applications.length - defaultCount
    const defaultRate = ((defaultCount / applications.length) * 100).toFixed(1)

    // Income distribution by contract type
    const incomeByContract: Record<string, { total: number; count: number }> = {}
    applications.forEach((app) => {
      const type = app.NAME_CONTRACT_TYPE || "Unknown"
      if (!incomeByContract[type]) incomeByContract[type] = { total: 0, count: 0 }
      incomeByContract[type].total += app.AMT_INCOME_TOTAL
      incomeByContract[type].count++
    })

    // Credit amount distribution
    const creditRanges = [
      { range: "0-100K", min: 0, max: 100000, count: 0, defaults: 0 },
      { range: "100K-300K", min: 100000, max: 300000, count: 0, defaults: 0 },
      { range: "300K-500K", min: 300000, max: 500000, count: 0, defaults: 0 },
      { range: "500K-1M", min: 500000, max: 1000000, count: 0, defaults: 0 },
      { range: "1M+", min: 1000000, max: Number.POSITIVE_INFINITY, count: 0, defaults: 0 },
    ]

    applications.forEach((app) => {
      const range = creditRanges.find((r) => app.AMT_CREDIT >= r.min && app.AMT_CREDIT < r.max)
      if (range) {
        range.count++
        if (app.TARGET === 1) range.defaults++
      }
    })

    // External source score distribution
    const extScoreRanges = [
      { range: "0.0-0.2", min: 0, max: 0.2, count: 0, defaults: 0 },
      { range: "0.2-0.4", min: 0.2, max: 0.4, count: 0, defaults: 0 },
      { range: "0.4-0.6", min: 0.4, max: 0.6, count: 0, defaults: 0 },
      { range: "0.6-0.8", min: 0.6, max: 0.8, count: 0, defaults: 0 },
      { range: "0.8-1.0", min: 0.8, max: 1.0, count: 0, defaults: 0 },
    ]

    applications.forEach((app) => {
      const avgScore = (app.EXT_SOURCE_1 + app.EXT_SOURCE_2 + app.EXT_SOURCE_3) / 3
      const range = extScoreRanges.find((r) => avgScore >= r.min && avgScore < r.max)
      if (range) {
        range.count++
        if (app.TARGET === 1) range.defaults++
      }
    })

    // Gender distribution
    const genderData = applications.reduce(
      (acc, app) => {
        const gender = app.CODE_GENDER === "M" ? "Male" : app.CODE_GENDER === "F" ? "Female" : "Other"
        if (!acc[gender]) acc[gender] = { count: 0, defaults: 0 }
        acc[gender].count++
        if (app.TARGET === 1) acc[gender].defaults++
        return acc
      },
      {} as Record<string, { count: number; defaults: number }>,
    )

    // Top risk factors
    const riskFactors = [
      {
        label: "Low External Score (< 0.3)",
        percentage: Math.round(
          (applications.filter((a) => (a.EXT_SOURCE_1 + a.EXT_SOURCE_2 + a.EXT_SOURCE_3) / 3 < 0.3).length /
            applications.length) *
            100,
        ),
        description: "Applicants with poor external credit scores",
      },
      {
        label: "High Credit-to-Income Ratio (> 5x)",
        percentage: Math.round(
          (applications.filter((a) => a.AMT_CREDIT / a.AMT_INCOME_TOTAL > 5).length / applications.length) * 100,
        ),
        description: "Credit amount exceeds 5x annual income",
      },
      {
        label: "Short Employment (< 1 year)",
        percentage: Math.round(
          (applications.filter((a) => Math.abs(a.DAYS_EMPLOYED) < 365).length / applications.length) * 100,
        ),
        description: "Less than 1 year at current employment",
      },
      {
        label: "Young Age (< 25 years)",
        percentage: Math.round(
          (applications.filter((a) => Math.abs(a.DAYS_BIRTH) / 365 < 25).length / applications.length) * 100,
        ),
        description: "Applicants under 25 years of age",
      },
    ]

    return {
      defaultCount,
      nonDefaultCount,
      defaultRate,
      incomeByContract: Object.entries(incomeByContract).map(([name, data]) => ({
        name,
        avgIncome: Math.round(data.total / data.count),
        count: data.count,
      })),
      creditRanges: creditRanges.map((r) => ({
        range: r.range,
        count: r.count,
        defaultRate: r.count > 0 ? ((r.defaults / r.count) * 100).toFixed(1) : "0",
      })),
      extScoreRanges: extScoreRanges.map((r) => ({
        range: r.range,
        count: r.count,
        defaultRate: r.count > 0 ? ((r.defaults / r.count) * 100).toFixed(1) : "0",
      })),
      genderData: Object.entries(genderData).map(([name, data]) => ({
        name,
        value: data.count,
        defaultRate: ((data.defaults / data.count) * 100).toFixed(1),
      })),
      riskFactors,
    }
  }, [dataLoaded, applications])

  const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#c7d2fe", "#e0e7ff"]

  if (!dataLoaded || !insights) {
    return (
      <div className="p-8">
        <div className="max-w-7xl">
          <h1 className="text-4xl font-bold text-foreground mb-2">Data Insights</h1>
          <p className="text-muted-foreground mb-8">Home Credit Default Risk Analysis</p>

          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
              <AlertTriangle className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">No Data Available</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Load the Home Credit Default Risk dataset from Kaggle to view comprehensive insights and analytics.
            </p>
            <Link href="/dashboard/kaggle-data">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Database className="w-4 h-4 mr-2" />
                Load Kaggle Data
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Data Insights</h1>
            <p className="text-muted-foreground">
              Analysis of {recordCount.toLocaleString()} Home Credit applications
              {loadedAt && ` • Data loaded at ${loadedAt.toLocaleTimeString()}`}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Applications"
            value={recordCount.toLocaleString()}
            change="Home Credit Dataset"
            positive
          />
          <StatCard
            label="Default Cases"
            value={insights.defaultCount.toLocaleString()}
            change={`${insights.defaultRate}% rate`}
            positive={false}
          />
          <StatCard
            label="Non-Default"
            value={insights.nonDefaultCount.toLocaleString()}
            change={`${(100 - Number.parseFloat(insights.defaultRate)).toFixed(1)}% rate`}
            positive
          />
          <StatCard
            label="Avg Credit Amount"
            value={`$${Math.round(applications.reduce((sum, a) => sum + a.AMT_CREDIT, 0) / applications.length).toLocaleString()}`}
            change="Per application"
            positive
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Default Rate by Credit Amount</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={insights.creditRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="range" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" name="Applications" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Default Rate by External Score</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={insights.extScoreRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="range" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="defaultRate" stroke="#ef4444" strokeWidth={2} name="Default Rate %" />
                <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} name="Applications" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <Card className="p-6 border border-border lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">Average Income by Contract Type</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={insights.incomeByContract} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={12} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Avg Income"]}
                />
                <Bar dataKey="avgIncome" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Gender Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={insights.genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {insights.genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Top Risk Factors in Dataset</h2>
          <div className="space-y-4">
            {insights.riskFactors.map((factor) => (
              <PatternRow
                key={factor.label}
                label={factor.label}
                percentage={factor.percentage}
                description={factor.description}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  change,
  positive = true,
}: {
  label: string
  value: string
  change: string
  positive?: boolean
}) {
  return (
    <Card className="p-6 border border-border">
      <p className="text-muted-foreground text-sm mb-2">{label}</p>
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <span className={`text-sm font-medium ${positive ? "text-green-600" : "text-destructive"}`}>{change}</span>
      </div>
    </Card>
  )
}

function PatternRow({
  label,
  percentage,
  description,
}: {
  label: string
  percentage: number
  description: string
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-foreground font-medium">{label}</p>
        <span className="text-primary font-semibold">{percentage}%</span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{description}</p>
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  )
}
