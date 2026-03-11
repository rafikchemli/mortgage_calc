import { useEffect } from 'react'
import { useDarkMode } from './hooks/useDarkMode'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Dashboard from './components/Dashboard'
import useAffordStore from './store/useAffordStore'
import { decodeHash } from './utils/shareUrl'

export default function App() {
  const { isDark, toggle } = useDarkMode()

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    const values = decodeHash(hash)
    if (values) {
      useAffordStore.getState().hydrateFromShare(values)
    }
    history.replaceState(null, '', window.location.pathname)
  }, [])

  return (
    <div className="enchanted-bg">
      <div className="max-w-6xl mx-auto">
        <Header isDark={isDark} toggleDark={toggle} />
        <main className="px-4 sm:px-6 py-4 sm:py-6">
          <Dashboard />
        </main>
        <Footer />
      </div>
    </div>
  )
}
