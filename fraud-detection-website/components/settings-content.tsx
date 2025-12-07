"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Bell, Lock, Database, AlertCircle, Mail, MessageSquare, FileText, Moon, Sun, Monitor } from "lucide-react"

export function SettingsContent() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your account and detection preferences</p>

        <div className="space-y-8">
          {/* Theme Settings */}
          <Card className="p-6 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <Sun className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">Select your preferred theme</p>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === "light"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Sun className="w-5 h-5" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === "dark"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Moon className="w-5 h-5" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === "system"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Monitor className="w-5 h-5" />
                  <span className="text-sm font-medium">System</span>
                </button>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
            </div>
            <div className="space-y-4">
              <SettingRow
                icon={<Mail className="w-4 h-4" />}
                label="Email Alerts"
                description="Receive email notifications for fraud alerts"
                defaultValue={true}
              />
              <SettingRow
                icon={<MessageSquare className="w-4 h-4" />}
                label="SMS Notifications"
                description="Get SMS alerts for high-risk transactions"
                defaultValue={false}
              />
              <SettingRow 
                icon={<FileText className="w-4 h-4" />}
                label="Daily Summary" 
                description="Receive daily fraud summary reports" 
                defaultValue={true} 
              />
            </div>
          </Card>

          {/* Security Settings */}
          <Card className="p-6 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Security</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Require 2FA for account access</p>
                </div>
                <Button variant="outline" className="h-9 bg-transparent">
                  Enable
                </Button>
              </div>
              <div className="border-t border-border pt-4 mt-4">
                <p className="font-medium text-foreground mb-3">Change Password</p>
                <Button variant="outline" className="h-9 bg-transparent">
                  Update Password
                </Button>
              </div>
            </div>
          </Card>

          {/* Detection Settings */}
          <Card className="p-6 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Detection</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Fraud Sensitivity</label>
                <div className="flex gap-2">
                  {["Low", "Medium", "High"].map((level) => (
                    <Button key={level} variant={level === "High" ? "default" : "outline"} className="flex-1">
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
              <SettingRow
                label="Real-time Detection"
                description="Enable real-time transaction monitoring"
                defaultValue={true}
              />
            </div>
          </Card>

          {/* Data Settings */}
          <Card className="p-6 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Data</h2>
            </div>
            <div className="space-y-4">
              <p className="text-foreground">Manage your data and exports</p>
              <div className="flex gap-3">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Export Data</Button>
                <Button variant="outline">Download Backup</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SettingRow({
  icon,
  label,
  description,
  defaultValue,
}: { icon?: React.ReactNode; label: string; description: string; defaultValue: boolean }) {
  const [isPressed, setIsPressed] = useState(defaultValue)

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <div className="flex-1">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center">
        <Toggle 
          defaultPressed={defaultValue} 
          onPressedChange={setIsPressed}
          aria-label={label} 
          className="flex items-center gap-2"
        >
          {icon && (
            <div className={`transition-colors ${isPressed ? "text-primary-foreground" : "text-primary"}`}>
              {icon}
            </div>
          )}
        </Toggle>
      </div>
    </div>
  )
}
