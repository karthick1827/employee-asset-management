export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
  )
}

const buttonVariants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:outline-indigo-600',
  danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50 focus-visible:outline-red-600',
  ghost: 'text-slate-600 hover:bg-slate-100',
}

export function Button({ variant = 'primary', className = '', disabled, children, ...props }) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${buttonVariants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${props.className || ''}`}
    />
  )
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${props.className || ''}`}
    />
  )
}

export function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}

export function ErrorText({ children }) {
  if (!children) return null
  return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{children}</p>
}

export function EmptyState({ children }) {
  return <p className="px-4 py-10 text-center text-sm text-slate-400">{children}</p>
}
