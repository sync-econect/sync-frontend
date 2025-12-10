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
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
                {value}
              </p>
              {trend && (
                <span
                  className={cn(
                    'text-xs sm:text-sm font-medium shrink-0',
                    trend.positive ? 'text-emerald-600' : styles.trend
                  )}
                >
                  {trend.value}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {description}
              </p>
            )}
          </div>
          <div
            className={cn(
              'p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0',
              styles.icon
            )}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
