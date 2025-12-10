import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RemittanceStatus, RawDataStatus, ValidationLevel } from '@/types';

const statusConfig: Record<
  RemittanceStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: 'Pendente',
    className: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  },
  VALIDATING: {
    label: 'Validando',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  TRANSFORMING: {
    label: 'Transformando',
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
  READY: {
    label: 'Pronta',
    className: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  },
  SENDING: {
    label: 'Enviando',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  SENT: {
    label: 'Enviada',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  ERROR: {
    label: 'Erro',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  CANCELLED: {
    label: 'Cancelada',
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  },
};

const rawDataStatusConfig: Record<
  RawDataStatus,
  { label: string; className: string }
> = {
  RECEIVED: {
    label: 'Recebido',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  PROCESSING: {
    label: 'Processando',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  PROCESSED: {
    label: 'Processado',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  ERROR: {
    label: 'Erro',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
};

const validationLevelConfig: Record<
  ValidationLevel,
  { label: string; className: string }
> = {
  IMPEDITIVA: {
    label: 'Impeditiva',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  ALERTA: {
    label: 'Alerta',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
};

interface StatusBadgeProps {
  status: RemittanceStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

interface RawDataStatusBadgeProps {
  status: RawDataStatus;
  className?: string;
}

export function RawDataStatusBadge({ status, className }: RawDataStatusBadgeProps) {
  const config = rawDataStatusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

interface ValidationLevelBadgeProps {
  level: ValidationLevel;
  className?: string;
}

export function ValidationLevelBadge({ level, className }: ValidationLevelBadgeProps) {
  const config = validationLevelConfig[level];

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

