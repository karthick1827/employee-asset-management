const STYLES = {
  available: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  assigned: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'in-repair': 'bg-orange-50 text-orange-700 ring-orange-600/20',
  retired: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  open: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  'in-progress': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
}

export default function StatusBadge({ status }) {
  const style = STYLES[status] || 'bg-slate-100 text-slate-600 ring-slate-500/20'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${style}`}
    >
      {status}
    </span>
  )
}
