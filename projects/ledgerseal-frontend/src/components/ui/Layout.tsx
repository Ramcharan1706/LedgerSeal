import { Outlet } from 'react-router-dom'
import Header from './Header'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
