'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JsonViewerProps {
  data: Record<string, unknown> | unknown[];
  title?: string;
  collapsed?: boolean;
  className?: string;
}

export function JsonViewer({ data, title, collapsed = false, className }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          {title || 'JSON'}
        </button>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2">
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      {!isCollapsed && (
        <pre className="max-h-96 overflow-auto bg-secondary/50 p-4 text-xs">
          <code className="font-mono text-secondary-foreground">
            {JSON.stringify(data, null, 2)}
          </code>
        </pre>
      )}
    </Card>
  );
}
