import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type PageLoadingProps = {
  message?: string;
  className?: string;
};

export function PageLoading({ message = 'Carregando...', className }: PageLoadingProps) {
  return (
    <div className={cn('flex min-h-full w-full flex-col items-center justify-center gap-3 p-10 text-center', className)}>
      <Loader2 className="size-7 animate-spin text-primary" aria-hidden />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
