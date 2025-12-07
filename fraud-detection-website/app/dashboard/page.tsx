"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ShieldAlert,
  CreditCard,
  Play,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Database,
  Users,
  FileText,
} from "lucide-react"
import { useDataStore } from "@/lib/data-store"

export default function DashboardPage() {
  const { dataLoaded, recordCount, applications, bureauRecords, previousApps, loadedAt } = useDataStore()

  const stats = dataLoaded
    ? {
        totalRecords: recordCount,
        defaultRisk: applications.filter((a) => a.TARGET === 1).length,
        avgCreditAmount: Math.round(
          applications.reduce((sum, a) => sum + a.AMT_CREDIT, 0) / applications.length,
        ).toLocaleString(),
        avgIncome: Math.round(
          applications.reduce((sum, a) => sum + a.AMT_INCOME_TOTAL, 0) / applications.length,
        ).toLocaleString(),
        bureauRecordsCount: bureauRecords.length,
        previousAppsCount: previousApps.length,
      }
    : null

  return (
    <div className="p-8">
      <div className="max-w-7xl">
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8">Home Credit Default Risk Analysis - FraudGuard AI Detection System</p>

        {dataLoaded ? (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-700">Kaggle Data Loaded</p>
                <p className="text-sm text-green-600">
                  {recordCount.toLocaleString()} applications | {bureauRecords.length.toLocaleString()} bureau records |{" "}
                  {previousApps.length.toLocaleString()} previous applications
                  {loadedAt && ` • Loaded at ${loadedAt.toLocaleTimeString()}`}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-700">No Data Loaded</p>
                  <p className="text-sm text-amber-600">
                    Load Home Credit Default Risk dataset from Kaggle to begin analysis
                  </p>
                </div>
              </div>
              <Link href="/dashboard/kaggle-data">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                  Load Data
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {dataLoaded && stats ? (
            <>
              <StatCard
                label="Total Applications"
                value={stats.totalRecords.toLocaleString()}
                icon={Users}
                subtitle="Home Credit records"
              />
              <StatCard
                label="Default Risk Cases"
                value={stats.defaultRisk.toLocaleString()}
                icon={AlertTriangle}
                subtitle={`${((stats.defaultRisk / stats.totalRecords) * 100).toFixed(1)}% default rate`}
                warning
              />
              <StatCard
                label="Avg Credit Amount"
                value={`$${stats.avgCreditAmount}`}
                icon={CreditCard}
                subtitle="Per application"
              />
              <StatCard
                label="Avg Annual Income"
                value={`$${stats.avgIncome}`}
                icon={Activity}
                subtitle="Per applicant"
              />
            </>
          ) : (
            <>
              <StatCard label="Total Applications" value="--" icon={Users} subtitle="Load data to view" />
              <StatCard label="Default Risk Cases" value="--" icon={AlertTriangle} subtitle="Load data to view" />
              <StatCard label="Avg Credit Amount" value="--" icon={CreditCard} subtitle="Load data to view" />
              <StatCard label="Avg Annual Income" value="--" icon={Activity} subtitle="Load data to view" />
            </>
          )}
        </div>

        {dataLoaded && stats && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.bureauRecordsCount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Bureau Credit Records</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.previousAppsCount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Previous Applications</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {(stats.totalRecords - stats.defaultRisk).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Non-Default Applications</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <ActionCard
            title="Fraud Detection"
            description="Analyze Home Credit applications for default risk with AI-powered explainable results."
            icon={ShieldAlert}
            href="/dashboard/fraud-detection"
            buttonText="Detect Risk"
            dataCount={dataLoaded ? recordCount : undefined}
          />
          <ActionCard
            title="Credit Scoring"
            description="Score applicants using credit model with SHAP-style feature importance analysis."
            icon={CreditCard}
            href="/dashboard/credit-scoring"
            buttonText="Score Applicants"
            dataCount={dataLoaded ? recordCount : undefined}
          />
          <ActionCard
            title="Default Simulation"
            description="Run real-time default risk simulation based on Home Credit patterns."
            icon={Play}
            href="/dashboard/simulation"
            buttonText="Start Simulation"
            dataCount={dataLoaded ? recordCount : undefined}
          />
        </div>

        {/* Analytics Links */}
        <h2 className="text-xl font-semibold text-foreground mb-4">Analytics & Reports</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/dashboard/insights">
            <Card className="p-6 border border-border hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Data Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    {dataLoaded
                      ? `Analyze ${recordCount.toLocaleString()} records for default patterns`
                      : "View detailed default patterns and analytics"}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/dashboard/forecasting">
            <Card className="p-6 border border-border hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Forecasting</h3>
                  <p className="text-sm text-muted-foreground">
                    {dataLoaded
                      ? "Predictive default trends from loaded data"
                      : "Predictive default trends and projections"}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  subtitle,
  warning = false,
}: {
  label: string
  value: string
  icon: React.ElementType
  subtitle: string
  warning?: boolean
}) {
  return (
    <Card className="p-6 border border-border">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${warning ? "bg-destructive/10" : "bg-primary/10"}`}
        >
          <Icon className={`w-5 h-5 ${warning ? "text-destructive" : "text-primary"}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </Card>
  )
}

function ActionCard({
  title,
  description,
  icon: Icon,
  href,
  buttonText,
  dataCount,
}: {
  title: string
  description: string
  icon: React.ElementType
  href: string
  buttonText: string
  dataCount?: number
}) {
  return (
    <Card className="p-6 border border-border flex flex-col">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-2 flex-1">{description}</p>
      {dataCount !== undefined && (
        <p className="text-xs text-primary font-medium mb-4">{dataCount.toLocaleString()} records available</p>
      )}
      <Link href={href}>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">{buttonText}</Button>
      </Link>
    </Card>
  )
}
