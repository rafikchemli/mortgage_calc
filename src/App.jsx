import { useDarkMode } from './hooks/useDarkMode'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Dashboard from './components/Dashboard'

export default function App() {
  const { isDark, toggle } = useDarkMode()

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
