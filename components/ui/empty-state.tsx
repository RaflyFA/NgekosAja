"use client"

import { FileQuestion, Inbox, Search, Users, Home, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    icon?: "inbox" | "search" | "users" | "home" | "payment" | "default"
    title: string
    description: string
    action?: {
        label: string
        onClick: () => void
    }
}

export function EmptyState({ icon = "default", title, description, action }: EmptyStateProps) {
    const getIcon = () => {
        const iconClass = "w-16 h-16 text-muted-foreground/50"
        switch (icon) {
            case "inbox": return <Inbox className={iconClass} />
            case "search": return <Search className={iconClass} />
            case "users": return <Users className={iconClass} />
            case "home": return <Home className={iconClass} />
            case "payment": return <CreditCard className={iconClass} />
            default: return <FileQuestion className={iconClass} />
        }
    }

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="rounded-full bg-muted/50 p-6 mb-6">
                {getIcon()}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">{description}</p>
            {action && (
                <Button onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    )
}
