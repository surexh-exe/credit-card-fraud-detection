"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import { NavBar } from "@/components/nav-bar"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero Section */}
      <section className="px-4 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance mb-4">
                Detect Fraud Before It Costs You
              </h1>
              <p className="text-xl text-muted-foreground text-balance">
                Advanced AI-powered fraud detection for credit card transactions with real-time insights and predictive
                forecasting.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/dashboard">
                <Button className="w-full sm:w-auto h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="w-full sm:w-auto h-12 px-8 bg-transparent">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-muted rounded-2xl p-8 aspect-square flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">98%</div>
                <p className="text-muted-foreground">Accuracy Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose FraudGuard?</h2>
            <p className="text-xl text-muted-foreground">Everything you need to protect your transactions</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Real-Time Detection"
              description="Analyze transactions instantly and flag suspicious activities before they happen."
            />
            <FeatureCard
              title="Advanced Analytics"
              description="Comprehensive dashboards with detailed insights into fraud patterns and trends."
            />
            <FeatureCard
              title="Predictive Forecasting"
              description="AI-powered predictions to anticipate and prevent future fraud attempts."
            />
            <FeatureCard
              title="Easy Integration"
              description="Upload your data with a single click. Support for CSV and other formats."
            />
            <FeatureCard
              title="Customizable Rules"
              description="Configure detection parameters that match your specific security requirements."
            />
            <FeatureCard
              title="Expert Support"
              description="24/7 customer support to help you maximize your fraud prevention capabilities."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">Ready to Protect Your Transactions?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of businesses using FraudGuard to detect and prevent fraud.
          </p>
          <Link href="/dashboard">
            <Button className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="p-6 border border-border hover:shadow-md transition-shadow">
      <Check className="w-6 h-6 text-primary mb-4" />
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  )
}
