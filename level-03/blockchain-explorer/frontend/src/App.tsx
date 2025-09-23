import { Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import { Layout } from './components/layout'

// Pages
import { Dashboard } from './pages/dashboard'
import { Blocks } from './pages/blocks'
import { BlockDetails } from './pages/block-details'
import { Transactions } from './pages/transactions'
import { TransactionDetails } from './pages/transaction-details'
import { Addresses } from './pages/addresses'
import { AddressDetails } from './pages/address-details'
import { Simulator } from './pages/simulator'
import { NotFound } from './pages/not-found'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="blocks" element={<Blocks />} />
          <Route path="blocks/:index" element={<BlockDetails />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="transactions/:id" element={<TransactionDetails />} />
          <Route path="addresses" element={<Addresses />} />
          <Route path="addresses/:address" element={<AddressDetails />} />
          <Route path="simulator" element={<Simulator />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App
