import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-lg text-sm font-medium ring-offset-background transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Botão "Cancelar" padrão usado em modais, alerts e formulários.
        // Mantém visual consistente com o modal de criação de curso.
        cancel:
          "border border-slate-200 bg-slate-50 text-white hover:bg-slate-100 hover:text-white dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:hover:bg-slate-700 dark:hover:text-white",
      },
      size: {
        default: "min-h-11 px-4 py-2 sm:h-10 sm:min-h-10",
        sm: "min-h-11 rounded-md px-3 sm:h-9 sm:min-h-9",
        lg: "min-h-12 rounded-md px-8 sm:h-11 sm:min-h-11",
        icon: "h-11 w-11 min-h-11 min-w-11 sm:h-10 sm:w-10 sm:min-h-10 sm:min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
