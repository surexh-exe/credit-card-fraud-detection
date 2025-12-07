"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  TrendingUp,
  Settings,
  User,
  LogOut,
  Home,
  ShieldAlert,
  CreditCard,
  Play,
  Shield,
  Database,
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    router.push("/")
  }

  const mainLinks = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/kaggle-data", label: "Kaggle Data", icon: Database },
    { href: "/dashboard/fraud-detection", label: "Fraud Detection", icon: ShieldAlert },
    { href: "/dashboard/credit-scoring", label: "Credit Scoring", icon: CreditCard },
    { href: "/dashboard/simulation", label: "Simulation", icon: Play },
    { href: "/dashboard/insights", label: "Data Insights", icon: BarChart3 },
    { href: "/dashboard/forecasting", label: "Forecasting", icon: TrendingUp },
  ]

  const settingsLinks = [
    { href: "/dashboard/admin", label: "Admin Panel", icon: Shield },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <aside className="w-64 border-r border-border bg-background h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">FraudGuard</h2>
        <p className="text-sm text-muted-foreground mt-1">AI Detection System</p>
      </div>

      <nav className="flex-1 overflow-auto p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-4">Analysis</p>
        <ul className="space-y-1 mb-6">
          {mainLinks.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive(href) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-4">Settings</p>
        <ul className="space-y-1">
          {settingsLinks.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive(href) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  )
}
