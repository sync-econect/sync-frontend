import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

const variantStyles = {
  default: {
    icon: 'bg-primary/10 text-primary',
    trend: 'text-muted-foreground',
  },
  success: {
    icon: 'bg-emerald-500/10 text-emerald-600',
    trend: 'text-emerald-600',
  },
  warning: {
    icon: 'bg-amber-500/10 text-amber-600',
    trend: 'text-amber-600',
  },
  error: {
    icon: 'bg-red-500/10 text-red-600',
    trend: 'text-red-600',
  },
};

export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: KpiCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {trend && (
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend.positive ? 'text-emerald-600' : styles.trend
                  )}
                >
                  {trend.value}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', styles.icon)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

