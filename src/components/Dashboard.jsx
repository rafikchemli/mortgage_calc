import { motion } from 'framer-motion'
import { useComputedAfford } from '../hooks/useComputedAfford'
import FinancesSection from './sections/FinancesSection'
import VerdictSection from './sections/VerdictSection'
import CashSection from './sections/CashSection'
import TermsSection from './sections/TermsSection'
import StickyResult from './sections/StickyResult'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const spring = { type: 'spring', stiffness: 300, damping: 24 }

export default function Dashboard() {
  const computed = useComputedAfford()

  return (
    <>
      <motion.div
        className="space-y-4 sm:space-y-5"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.section variants={fadeUp} transition={spring}>
          <FinancesSection />
        </motion.section>

        <motion.section variants={fadeUp} transition={spring}>
          <VerdictSection computed={computed} />
        </motion.section>

        <motion.section variants={fadeUp} transition={spring}>
          <CashSection computed={computed} />
        </motion.section>

        <motion.section variants={fadeUp} transition={spring}>
          <TermsSection computed={computed} />
        </motion.section>
      </motion.div>

      <StickyResult computed={computed} />
    </>
  )
}
