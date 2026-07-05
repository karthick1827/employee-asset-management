import { NavLink } from 'react-router-dom'
import { Boxes, LayoutDashboard, Users, Laptop, Wrench, UserCircle, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const linkBase =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
const linkActive = 'bg-indigo-50 text-indigo-700'
const linkInactive = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'

function Item({ to, icon: Icon, children }) {
  return (
    <NavLink to={to} end={to === '/'} className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
      <Icon size={18} strokeWidth={2} />
      {children}
    </NavLink>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Boxes size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-slate-900">EAMS</p>
          <p className="text-xs leading-tight text-slate-400">Asset Management</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {(user.role === 'admin' || user.role === 'hr') && (
          <Item to="/" icon={LayoutDashboard}>
            Dashboard
          </Item>
        )}
        {(user.role === 'admin' || user.role === 'hr') && (
          <Item to="/employees" icon={Users}>
            Employees
          </Item>
        )}
        <Item to="/assets" icon={Laptop}>
          Assets
        </Item>
        {user.role === 'admin' && (
          <Item to="/maintenance" icon={Wrench}>
            Maintenance
          </Item>
        )}
        {user.role === 'staff' && (
          <Item to="/my-assets" icon={UserCircle}>
            My Assets
          </Item>
        )}
      </nav>

      <div className="flex items-center gap-3 border-t border-slate-200 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
          <p className="truncate text-xs capitalize text-slate-400">{user.role}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          title="Log out"
          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  )
}
