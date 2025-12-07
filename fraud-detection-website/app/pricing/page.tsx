"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import { NavBar } from "@/components/nav-bar"

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "$99",
      description: "For small businesses getting started",
      features: [
        "Up to 10,000 transactions/month",
        "Basic fraud detection",
        "Standard support",
        "Email alerts",
        "CSV export",
      ],
    },
    {
      name: "Professional",
      price: "$299",
      description: "For growing businesses",
      featured: true,
      features: [
        "Up to 100,000 transactions/month",
        "Advanced AI detection",
        "Priority support",
        "Real-time alerts",
        "API access",
        "Custom rules",
        "Data insights dashboard",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large scale operations",
      features: [
        "Unlimited transactions",
        "Custom ML models",
        "Dedicated support",
        "Webhook integration",
        "Advanced analytics",
        "Multi-user accounts",
        "SLA guarantee",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <section className="px-4 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground">Choose the plan that fits your business needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 flex flex-col border-2 transition-all ${
                plan.featured ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h2>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
              </div>
              <Button
                className={`w-full mb-8 h-11 ${
                  plan.featured
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                Get Started
              </Button>
              <ul className="space-y-4 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 items-start">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <Card className="p-8 bg-muted/50 border-border text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">Need a custom solution?</h3>
          <p className="text-muted-foreground mb-4">
            Contact our sales team for enterprise pricing and custom configurations.
          </p>
          <Button variant="outline">Schedule a Demo</Button>
        </Card>
      </section>
    </div>
  )
}
