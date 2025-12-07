"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-foreground">
          FraudGuard
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/pricing" className="text-foreground hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="/" className="text-foreground hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/dashboard">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Dashboard</Button>
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {isOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b border-border p-4 space-y-4 md:hidden">
            <Link href="/pricing" className="block text-foreground hover:text-primary">
              Pricing
            </Link>
            <Link href="/" className="block text-foreground hover:text-primary">
              About
            </Link>
            <Link href="/dashboard">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Dashboard</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
