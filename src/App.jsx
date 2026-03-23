import { useEffect } from 'react'
import { LazyMotion, domAnimation } from 'framer-motion'
import { useDarkMode } from './hooks/useDarkMode'
import StepFlow from './components/StepFlow'
import PrivacyNotice from './components/layout/PrivacyNotice'
import useAffordStore from './store/useAffordStore'
import { decodeShareParams } from './utils/shareUrl'

export default function App() {
  const { isDark, toggle } = useDarkMode()

  useEffect(() => {
    const values = decodeShareParams()
    if (values) {
      useAffordStore.getState().hydrateFromShare(values)
      history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="app-bg">
        <StepFlow isDark={isDark} toggleDark={toggle} />
        <PrivacyNotice />
      </div>
    </LazyMotion>
  )
}
