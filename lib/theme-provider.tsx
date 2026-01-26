"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

const initialState: ThemeProviderState = {
    theme: "light",
    setTheme: () => null,
    toggleTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "light",
    storageKey = "ngekosaja-theme",
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Get theme from localStorage or system preference
        const stored = localStorage.getItem(storageKey) as Theme | null
        if (stored) {
            setTheme(stored)
        } else {
            // Check system preference
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
            setTheme(prefersDark ? "dark" : "light")
        }
    }, [storageKey])

    useEffect(() => {
        if (!mounted) return

        const root = window.document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(theme)
        localStorage.setItem(storageKey, theme)
    }, [theme, storageKey, mounted])

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === "light" ? "dark" : "light")
    }

    const value = {
        theme,
        setTheme,
        toggleTheme,
    }

    // Prevent flash of wrong theme
    if (!mounted) {
        return <>{children}</>
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
