"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface JsonViewerProps {
  data: any
  title?: string
}

export function JsonViewer({ data, title }: JsonViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="overflow-hidden">
      {title && (
        <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2">
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      )}
      <pre className="max-h-96 overflow-auto bg-secondary p-4 text-xs">
        <code className="font-mono text-secondary-foreground">{JSON.stringify(data, null, 2)}</code>
      </pre>
    </Card>
  )
}
