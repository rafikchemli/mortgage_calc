import { motion } from 'framer-motion'
import { useDarkMode } from './hooks/useDarkMode'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Dashboard from './components/Dashboard'

export default function App() {
  const { isDark, toggle, wipeControls, overlayColor } = useDarkMode()

  return (
    <div className="enchanted-bg">
      <div className="theme-wipe">
        <motion.div
          className="theme-wipe-inner"
          animate={wipeControls}
          initial={{ scaleX: 0, transformOrigin: '0% 50%' }}
          style={{ background: overlayColor }}
        />
      </div>
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
