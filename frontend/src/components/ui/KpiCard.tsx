import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export type KpiCardProps = {
  label: string
  value: string | number
  icon?: React.ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}

const toneMap: Record<NonNullable<KpiCardProps['tone']>, string> = {
  neutral: 'text-primary',
  success: 'text-traffic-green',
  warning: 'text-warning-yellow',
  danger: 'text-critical-red',
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon, tone = 'neutral' }) => {
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="kpi-card">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-2.5 rounded-lg bg-white/5', toneMap[tone])}>
          {icon}
        </div>
      </div>
      <p className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">{label}</p>
      <h3 className="text-2xl font-semibold tracking-tight text-slate-100">{value}</h3>
    </motion.div>
  )
}

export default KpiCard
