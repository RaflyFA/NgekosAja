"use client"

import { useTheme } from "@/lib/theme-provider"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className="relative inline-flex h-9 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-slate-200 dark:bg-slate-700"
            aria-label="Toggle theme"
        >
            {/* Track */}
            <span className="sr-only">Toggle theme</span>

            {/* Slider */}
            <span
                className={`inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-lg transition-transform ${theme === "dark" ? "translate-x-8" : "translate-x-1"
                    }`}
            >
                {theme === "light" ? (
                    <Sun className="h-4 w-4 text-yellow-500" />
                ) : (
                    <Moon className="h-4 w-4 text-blue-400" />
                )}
            </span>
        </button>
    )
}
