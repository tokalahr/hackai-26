import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-blue-900 text-blue-200 text-center text-xs py-3">
        © 2026 UniLearn — HackAI 26
      </footer>
    </div>
  )
}
