import { Badge } from '@/components/ui/badge';
import { TableStatus } from '@/types';

interface StatusBadgeProps {
  status: TableStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case TableStatus.AVAILABLE:
        return {
          label: 'Disponible',
          variant: 'default' as const,
          className: 'bg-green-500 hover:bg-green-600 text-white',
          icon: '🟢',
        };
      case TableStatus.OCCUPIED:
        return {
          label: 'Ocupada',
          variant: 'destructive' as const,
          className: 'bg-red-500 hover:bg-red-600 text-white',
          icon: '🔴',
        };
      case TableStatus.REQUESTED:
        return {
          label: 'Solicitud Activa',
          variant: 'default' as const,
          className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
          icon: '🟡',
        };
      default:
        return {
          label: 'Desconocido',
          variant: 'secondary' as const,
          className: '',
          icon: '⚪',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={`${config.className} ${className}`.trim()}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}
