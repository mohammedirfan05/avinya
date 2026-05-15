import React from 'react'
import { cn } from '../../lib/utils'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  children,
  variant = 'primary',
  size = 'md',
  ...props
}, ref) => {
  const base = 'btn'
  const variantClass = variant === 'primary' ? 'btn-primary' : 'bg-transparent text-slate-200 hover:bg-white/3'
  return (
    <button
      ref={ref}
      className={cn(base, variantClass, sizeMap[size], className)}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
