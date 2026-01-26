"use client"

import { useEffect } from "react"

/**
 * Component wrapper untuk memaksa light mode pada halaman tertentu
 * Digunakan untuk halaman login dan register
 */
export function ForceLightMode({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Simpan theme saat ini
        const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light"

        // Paksa light mode
        document.documentElement.classList.remove("dark")
        document.documentElement.classList.add("light")

        // Cleanup: kembalikan theme saat component unmount
        return () => {
            if (currentTheme === "dark") {
                document.documentElement.classList.remove("light")
                document.documentElement.classList.add("dark")
            }
        }
    }, [])

    return <>{children}</>
}
