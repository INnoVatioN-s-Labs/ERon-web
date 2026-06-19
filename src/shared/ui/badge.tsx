import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground',
        success:
          'border-transparent bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]',
        warning:
          'border-transparent bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]',
        win: 'border-transparent bg-emerald-500 text-slate-950',
        podium: 'border-transparent bg-sky-500 text-slate-950',
        loss: 'border-transparent bg-slate-600 text-slate-50',
        escape: 'border-transparent bg-violet-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
}
