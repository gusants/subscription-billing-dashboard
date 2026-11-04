import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover',
  secondary:
    'border border-border bg-surface text-fg hover:border-border-strong',
  danger: 'border border-danger/40 bg-surface text-danger hover:bg-danger-soft',
}

type ButtonProps = Omit<AriaButtonProps, 'className'> & {
  variant?: ButtonVariant
  className?: string
}

export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className={`inline-flex h-9 cursor-default items-center justify-center gap-2 rounded-md px-3.5 font-medium transition-colors data-disabled:opacity-50 data-pending:opacity-70 ${variantClasses[variant]} ${className}`}
    />
  )
}
