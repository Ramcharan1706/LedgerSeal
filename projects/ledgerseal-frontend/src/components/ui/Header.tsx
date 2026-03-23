import { useLocation, Link } from 'react-router-dom'
import { useWallet } from '@txnlab/use-wallet-react'
import { ellipseAddress } from '../../utils/ellipseAddress'
import {
  ShieldCheckIcon,
  DocumentPlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  WalletIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

const NAV_ITEMS = [
  {
    path: '/',
    label: 'Dashboard',
    icon: ShieldCheckIcon
  },
  {
    path: '/upload',
    label: 'Upload Evidence',
    icon: DocumentPlusIcon
  },
  {
    path: '/verify',
    label: 'Verify',
    icon: MagnifyingGlassIcon
  },
  {
    path: '/chain',
    label: 'Chain of Custody',
    icon: ClockIcon
  },
]

export default function Header() {
  const { activeAddress } = useWallet()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="glass-card sticky top-0 z-50 px-6 py-4 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
            <ShieldCheckIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              ChainProof
            </h1>
            <p className="text-xs text-white/60 font-medium">Digital Evidence Verification</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                location.pathname === path
                  ? 'bg-white/10 backdrop-blur-sm border border-white/30 shadow-lg'
                  : 'hover:bg-white/5 hover:shadow-md text-white/80 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Wallet & Mobile Menu */}
        <div className="flex items-center gap-4">
          <div className="wallet-btn md:flex items-center gap-2 hidden">
            <WalletIcon className="w-5 h-5" />
            {activeAddress ? (
              <span className="text-sm font-medium">
                {ellipseAddress(activeAddress, 6)}
              </span>
            ) : (
              <span className="text-sm">Connect Wallet</span>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/10">
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${
                  location.pathname === path
                    ? 'bg-white/10 border border-white/30'
                    : 'hover:bg-white/10'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
