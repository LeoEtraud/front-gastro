import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface LegalDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  children: React.ReactNode;
  footerNote?: string;
}

export function LegalDocumentModal({
  open,
  onOpenChange,
  title,
  subtitle,
  icon: Icon,
  children,
  footerNote,
}: LegalDocumentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        frameless
        className="max-h-[90dvh] min-h-0 gap-0 overflow-hidden rounded-2xl border-0 bg-card p-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)] sm:max-w-4xl lg:max-w-5xl"
        hideCloseButton
      >
        <div className="relative shrink-0 overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary via-primary to-indigo-900 px-4 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-5">
          <DialogClose
            type="button"
            className="absolute right-2 top-2 z-20 flex size-8 items-center justify-center rounded-md border border-white/30 bg-white/15 text-primary-foreground shadow-none outline-none transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-0 sm:right-3 sm:top-3"
            aria-label="Fechar"
          >
            <X className="size-3.5 shrink-0" aria-hidden />
          </DialogClose>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 h-48 w-48 translate-x-1/3 -translate-y-1/2 rounded-full bg-white" />
          </div>
          <DialogHeader className="relative z-10 space-y-1 pr-12 text-left sm:pr-14">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-white/20 bg-white/15 p-2.5 shadow-lg backdrop-blur-sm">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base font-bold tracking-tight text-primary-foreground sm:text-lg">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-xs text-primary-foreground/90 sm:text-sm">
                  {subtitle}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-card [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
          {children}
        </div>

        {footerNote ? (
          <div className="shrink-0 overflow-hidden rounded-b-2xl border-t border-border bg-muted px-4 py-3 text-justify text-xs leading-relaxed text-muted-foreground sm:px-6">
            {footerNote}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function LegalBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'divide-y divide-border px-4 py-4 text-sm text-muted-foreground sm:px-6 sm:py-5 [&_h3]:mb-2 [&_h3]:text-left [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:text-pretty [&_li]:leading-relaxed [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:text-justify [&_p]:text-pretty [&_p]:leading-relaxed [&_section+section]:mt-0 [&_ul]:list-[lower-alpha] [&_ul]:space-y-1 [&_ul]:pl-5',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-4 first:pt-0 sm:py-5">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
