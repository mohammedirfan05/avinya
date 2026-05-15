import React from 'react'
import { cn } from '../../lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  id?: string
  error?: string | null
  help?: string | null
  inputClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, id, error, help, className, inputClassName, ...props }, ref) => {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label ? <label htmlFor={id} className='text-sm text-slate-300'>{label}</label> : null}
      <input id={id} ref={ref} className={cn('input-field', inputClassName)} {...props} />
      {error ? <p className='text-xs text-danger mt-1'>{error}</p> : help ? <p className='text-xs text-slate-400 mt-1'>{help}</p> : null}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
