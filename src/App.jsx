import { useEffect } from 'react'
import { useDarkMode } from './hooks/useDarkMode'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Dashboard from './components/Dashboard'
import useAffordStore from './store/useAffordStore'
import { useComputedAfford } from './hooks/useComputedAfford'
import { decodeShareParams } from './utils/shareUrl'

export default function App() {
  const { isDark, toggle } = useDarkMode()
  const { maxPrice } = useComputedAfford()

  useEffect(() => {
    const values = decodeShareParams()
    if (values) {
      useAffordStore.getState().hydrateFromShare(values)
      history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  return (
    <div className="enchanted-bg">
      <div className="max-w-6xl mx-auto">
        <Header isDark={isDark} toggleDark={toggle} maxPrice={maxPrice} />
        <main className="px-4 sm:px-6 py-4 sm:py-6">
          <Dashboard />
        </main>
        <Footer />
      </div>
    </div>
  )
}
