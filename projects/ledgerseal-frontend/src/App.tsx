import { SupportedWallet, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/ui/Layout'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Verify from './pages/Verify'
import ChainOfCustody from './pages/ChainOfCustody'
import EvidenceDetail from './pages/EvidenceDetail'
import TransferOwnership from './pages/TransferOwnership'
import Certificate from './pages/Certificate'
import EvidenceHistory from './pages/EvidenceHistory'
import VerificationLogs from './pages/VerificationLogs'
import TamperSim from './pages/TamperSim'
import Settings from './pages/Settings'
import ErrorBoundary from './components/ErrorBoundary'
import { Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

let supportedWallets: SupportedWallet[]
if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
  const kmdConfig = getKmdConfigFromViteEnvironment()
  supportedWallets = [
    {
      id: WalletId.KMD,
      options: {
        baseServer: kmdConfig.server,
        token: String(kmdConfig.token),
        port: String(kmdConfig.port),
      },
    },
  ]
} else {
  supportedWallets = [
    { id: WalletId.DEFLY },
    { id: WalletId.PERA },
    { id: WalletId.EXODUS },
    // If you are interested in WalletConnect v2 provider
    // refer to https://github.com/TxnLab/use-wallet for detailed integration instructions
  ]
}

export default function App() {
  const algodConfig = getAlgodConfigFromViteEnvironment()

  const walletManager = new WalletManager({
    wallets: supportedWallets,
    defaultNetwork: algodConfig.network,
    networks: {
      [algodConfig.network]: {
        algod: {
          baseServer: algodConfig.server,
          port: algodConfig.port,
          token: String(algodConfig.token),
        },
      },
    },
    options: {
      resetNetwork: true,
    },
  })

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60 * 1000,
      },
    },
  });

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
          <div className="text-white text-xl animate-pulse">Loading LedgerSeal...</div>
        </div>}>
          <SnackbarProvider maxSnack={3}>
            <WalletProvider manager={walletManager}>
              <BrowserRouter>
                <Routes>
<Route path="/" element={<Layout />}>
  <Route index element={<Dashboard />} />
  <Route path="upload" element={<Upload />} />
  <Route path="verify" element={<Verify />} />
  <Route path="chain" element={<ChainOfCustody />} />
  <Route path="detail/:id" element={<EvidenceDetail />} />
  <Route path="transfer" element={<TransferOwnership />} />
  <Route path="certificate" element={<Certificate />} />
  <Route path="history" element={<EvidenceHistory />} />
<Route path="logs" element={<VerificationLogs />} />
  <Route path="tamper" element={<TamperSim />} />
  <Route path="settings" element={<Settings />} />
  <Route path="certificate/:id?" element={<Certificate />} />
</Route>
                </Routes>
              </BrowserRouter>
            </WalletProvider>
          </SnackbarProvider>
        </Suspense>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
