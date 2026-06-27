import { Button } from '@/components/ui/button';
import { LucideIcon, Loader2 } from 'lucide-react';

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  className?: string;
}

export function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  loading = false,
  variant = 'default',
  className = '',
}: ActionButtonProps) {
  const classes = `h-24 flex-col gap-2 text-lg ${className}`.trim();

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant={variant}
      size="lg"
      className={classes}
    >
      {loading ? (
        <Loader2 className="h-8 w-8 animate-spin" />
      ) : (
        <Icon className="h-8 w-8" />
      )}
      <span>{label}</span>
    </Button>
  );
}
