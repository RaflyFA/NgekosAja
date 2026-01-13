import { Card } from "@/components/ui/card"

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: string
}

export function MetricCard({ title, value, subtitle, icon }: MetricCardProps) {
  return (
    <Card className="p-6 border border-border bg-card hover:bg-secondary/20 transition-colors">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <span className="text-2xl">{icon}</span>
        </div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </Card>
  )
}
