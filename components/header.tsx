"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">K</span>
          </div>
          <span className="font-bold text-lg text-foreground hidden sm:inline">KosanHub</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-foreground hover:text-primary transition-colors">
            Cari Kos
          </Link>
          <Link href="#" className="text-foreground hover:text-primary transition-colors">
            Sewakan Kos
          </Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Masuk
            </Button>
          </Link>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            Daftar
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-4">
            <Link href="#" className="block text-foreground hover:text-primary">
              Cari Kos
            </Link>
            <Link href="#" className="block text-foreground hover:text-primary">
              Sewakan Kos
            </Link>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 bg-transparent" size="sm">
                Masuk
              </Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90" size="sm">
                Daftar
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
