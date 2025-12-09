import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-8 py-6">
      <div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-card-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
