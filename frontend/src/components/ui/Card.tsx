import React from 'react'
import { cn } from '../../lib/utils'

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string
}

export const Card: React.FC<CardProps> = ({ title, children, className, ...props }) => {
  return (
    <div className={cn('card', className)} {...props}>
      {title ? <div className='mb-2 text-sm font-medium text-slate-200'>{title}</div> : null}
      <div>{children}</div>
    </div>
  )
}

export default Card
