"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, MapPin, Briefcase } from "lucide-react"

export function ProfileContent() {
  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground mb-8">Manage your account information</p>

        {/* Profile Header */}
        <Card className="p-8 border border-border mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Suresh Kumar G</h2>
                <p className="text-muted-foreground">CEO of TechCorp Inc.</p>
                <p className="text-sm text-muted-foreground mt-2">Member since January 2024</p>
              </div>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Edit Profile</Button>
          </div>
        </Card>

        {/* Profile Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6">Contact Information</h3>
            <div className="space-y-4">
              <ProfileField icon={Mail} label="Email" value="sureshkumarg028@gmail.com" />
              <ProfileField icon={Phone} label="Phone" value="+91 7483563854" />
              <ProfileField icon={MapPin} label="Location" value="San Francisco, CA" />
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6">Organization</h3>
            <div className="space-y-4">
              <ProfileField icon={Briefcase} label="Company" value="TechCorp Inc." />
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">Plan</p>
                <p className="text-foreground font-medium">Professional Plan</p>
              </div>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">Billing Period</p>
                <p className="text-foreground font-medium">Monthly</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Usage Stats */}
        <Card className="p-6 border border-border mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-6">Usage Statistics</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <UsageItem label="Transactions Analyzed" value="12,453" />
            <UsageItem label="API Calls" value="45,231" />
            <UsageItem label="Storage Used" value="2.4 GB / 10 GB" />
            <UsageItem label="Data Points" value="1.2M" />
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-2 border-destructive/20 bg-destructive/5">
          <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
          <p className="text-muted-foreground mb-4">Irreversible actions</p>
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
          >
            Delete Account
          </Button>
        </Card>
      </div>
    </div>
  )
}

function ProfileField({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-primary flex-shrink-0" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-foreground font-medium">{value}</p>
      </div>
    </div>
  )
}

function UsageItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
}
