import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  /** Classes extras no botão de fechar (último filho do conteúdo). */
  closeButtonClassName?: string;
  /** Quando true, não renderiza o botão padrão (use um `DialogClose` dentro do conteúdo). */
  hideCloseButton?: boolean;
  /** Remove borda padrão do painel (útil para modais full-bleed com header color = bordas). */
  frameless?: boolean;
  /** Animação de entrada: `formal` para documentos legais (mais lenta e sóbria). */
  animationVariant?: 'default' | 'formal';
  /** Classes extras no overlay (ex.: animação formal). */
  overlayClassName?: string;
};

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, closeButtonClassName, hideCloseButton, frameless, animationVariant = 'default', overlayClassName, ...props }, ref) => {
  const isFormal = animationVariant === 'formal';

  return (
  <DialogPortal>
    {isFormal ? (
      <DialogPrimitive.Overlay
        className={cn(
          'legal-modal-overlay fixed inset-0 z-50 bg-black/70',
          overlayClassName,
        )}
      />
    ) : (
      <DialogOverlay className={overlayClassName} />
    )}
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        isFormal
          ? 'legal-modal-content fixed inset-0 z-50 flex max-h-none w-auto max-w-none translate-x-0 translate-y-0 items-center justify-center gap-0 border-0 bg-transparent p-4 shadow-none outline-none sm:p-6'
          : 'fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl bg-background p-4 shadow-lg duration-200 sm:w-full sm:p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        !isFormal && 'shadow-lg',
        !isFormal &&
          (frameless
            ? 'flex flex-col overflow-hidden rounded-2xl border-0 border-none outline-none ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0'
            : 'grid overflow-y-auto border'),
        !isFormal && className,
      )}
      {...props}
    >
      {isFormal ? (
        <div
          className={cn(
            'legal-modal-panel pointer-events-auto flex max-h-[92dvh] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl bg-background shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)] sm:w-full',
            frameless
              ? 'border-0 border-none ring-0'
              : 'border',
            className,
          )}
        >
          {children}
        </div>
      ) : (
        children
      )}
      {!hideCloseButton ? (
        <DialogPrimitive.Close
          className={cn(
            "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
            closeButtonClassName,
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      ) : null}
    </DialogPrimitive.Content>
  </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
