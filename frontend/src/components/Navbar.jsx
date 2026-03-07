import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/about', label: 'About' },
  { to: '/login', label: 'Login' },
]

export default function Navbar() {
  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <span className="text-xl font-bold tracking-wide">UniLearn</span>
        <ul className="flex gap-6 text-sm font-medium">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  isActive
                    ? 'text-yellow-300 underline underline-offset-4'
                    : 'hover:text-yellow-200 transition-colors'
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
