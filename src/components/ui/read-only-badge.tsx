import { AlertCircle, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ReadOnlyBadgeProps {
  message?: string;
  className?: string;
  variant?: 'inline' | 'banner';
}

export function ReadOnlyBadge({
  message = 'Você está visualizando em modo somente leitura',
  className,
  variant = 'inline',
}: ReadOnlyBadgeProps) {
  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-3 mb-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800',
          className
        )}
      >
        <Eye className="w-5 h-5 shrink-0" />
        <div>
          <p className="font-medium text-sm">Modo Somente Leitura</p>
          <p className="text-xs text-amber-700">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full',
        className
      )}
    >
      <Eye className="w-3 h-3" />
      Somente Leitura
    </span>
  );
}

export function ReadOnlyAlert({
  message = 'Esta ação é realizada pela imobiliária em seu nome',
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800',
        className
      )}
    >
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-sm">Ação Gerenciada pela Imobiliária</p>
        <p className="text-xs text-blue-700 mt-1">{message}</p>
      </div>
    </div>
  );
}

export default ReadOnlyBadge;
