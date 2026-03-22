import { useMemo } from 'react'
import useAffordStore from '../store/useAffordStore'
import { calcMaxAffordablePrice, calcCostBreakdownForPrice, calcStressTest } from '../calc/affordability'
import { calcCMHCInsurance } from '../calc/insurance'
import { calcWelcomeTax } from '../calc/taxes'
import { grossToNetAnnual } from '../calc/incomeTax'
import { useDebounce } from './useDebounce'
import { CLOSING_COSTS } from '../data/constants'

function toMonthly(value, frequency) {
  switch (frequency) {
    case 'biweekly': return value * 26 / 12
    case 'monthly': return value
    case 'yearly': return value / 12
    default: return value * 26 / 12
  }
}

function toAnnual(value, frequency) {
  switch (frequency) {
    case 'biweekly': return value * 26
    case 'monthly': return value * 12
    case 'yearly': return value
    default: return value * 26
  }
}

export { toMonthly, toAnnual }

export function useComputedAfford() {
  const state = useAffordStore()

  const {
    income1, income2, payFrequency1, payFrequency2, incomeType, savings,
    priceOverride, condoFeesMonthly,
    interestRate, amortizationYears, downPaymentPercent, locationId,
  } = state

  const annualRate = interestRate / 100

  // Each partner's income → monthly net (each may have different pay frequency)
  let monthlyIncome1, monthlyIncome2
  if (incomeType === 'gross') {
    monthlyIncome1 = grossToNetAnnual(toAnnual(income1, payFrequency1)) / 12
    monthlyIncome2 = grossToNetAnnual(toAnnual(income2, payFrequency2)) / 12
  } else {
    monthlyIncome1 = toMonthly(income1, payFrequency1)
    monthlyIncome2 = toMonthly(income2, payFrequency2)
  }
  const totalMonthlyIncome = monthlyIncome1 + monthlyIncome2

  // Monthly budget (35% of income — moderate threshold)
  const monthlyBudget = totalMonthlyIncome * 0.35

  // Debounce
  const dBudget = useDebounce(monthlyBudget, 200)
  const dDown = useDebounce(downPaymentPercent, 200)
  const dRate = useDebounce(annualRate, 200)
  const dYears = useDebounce(amortizationYears, 200)
  const dOverride = useDebounce(priceOverride, 200)
  const dCondoFees = useDebounce(condoFeesMonthly, 200)

  // Max affordable price (the reverse calculation)
  const maxPrice = useMemo(
    () => calcMaxAffordablePrice(dBudget, dDown, dRate, dYears, locationId),
    [dBudget, dDown, dRate, dYears, locationId]
  )

  // Active price = override if set, otherwise max affordable
  const isOverride = dOverride > 0
  const activePrice = isOverride ? dOverride : maxPrice

  // Down payment amount
  const downPaymentAmount = activePrice * (downPaymentPercent / 100)

  // Cost breakdown for active price
  const baseCostBreakdown = useMemo(
    () => calcCostBreakdownForPrice(activePrice, dDown, dRate, dYears, locationId),
    [activePrice, dDown, dRate, dYears, locationId]
  )

  // Add condo fees if present
  const costBreakdown = useMemo(() => {
    if (dCondoFees <= 0) return baseCostBreakdown
    const items = [
      ...baseCostBreakdown.items,
      { name: 'Condo Fees', value: Math.round(dCondoFees) },
    ]
    return { items, total: items.reduce((s, i) => s + i.value, 0) }
  }, [baseCostBreakdown, dCondoFees])

  // Housing % of income
  const housingPercent = totalMonthlyIncome > 0
    ? (costBreakdown.total / totalMonthlyIncome) * 100
    : 0

  // Partner split (proportional)
  const hasPartner = monthlyIncome2 > 0
  const share1 = totalMonthlyIncome > 0
    ? costBreakdown.total * (monthlyIncome1 / totalMonthlyIncome)
    : costBreakdown.total
  const share2 = totalMonthlyIncome > 0
    ? costBreakdown.total * (monthlyIncome2 / totalMonthlyIncome)
    : 0

  // Stress test
  const stressTest = useMemo(
    () => calcStressTest(activePrice, dDown, dRate, 0.02, dYears, locationId),
    [activePrice, dDown, dRate, dYears, locationId]
  )

  // Upfront costs
  const cmhc = useMemo(
    () => calcCMHCInsurance(activePrice, dDown, dYears),
    [activePrice, dDown, dYears]
  )

  const welcomeTax = useMemo(
    () => calcWelcomeTax(activePrice, locationId),
    [activePrice, locationId]
  )

  const closingTotal = CLOSING_COSTS.notary + CLOSING_COSTS.homeInspection
  const cashNeeded = downPaymentAmount + welcomeTax.total + closingTotal
    + (cmhc.isRequired && !cmhc.exceedsMax ? cmhc.qst : 0)

  // Savings gap
  const savingsGap = Math.max(0, cashNeeded - savings)
  const savingsCovered = savings >= cashNeeded

  return {
    // Core
    maxPrice,
    activePrice,
    isOverride,
    downPaymentAmount,
    downPaymentPercent,

    // Income
    monthlyIncome1,
    monthlyIncome2,
    totalMonthlyIncome,
    hasPartner,
    monthlyBudget,

    // Costs
    costBreakdown,
    housingPercent: Math.round(housingPercent),
    share1: Math.round(share1),
    share2: Math.round(share2),

    // Upfront
    cmhc,
    welcomeTax,
    cashNeeded,
    savings,
    savingsGap,
    savingsCovered,

    // Stress
    stressTest,
    interestRate,
    amortizationYears,
    locationId,
    condoFeesMonthly,
  }
}
