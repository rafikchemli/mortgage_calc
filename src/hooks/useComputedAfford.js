import { useMemo } from 'react'
import useAffordStore from '../store/useAffordStore'
import { useShallow } from 'zustand/react/shallow'
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
  const {
    income1, income2, payFrequency1, payFrequency2, incomeType, savings,
    priceOverride, condoFeesMonthly,
    housingBudgetPercent, interestRate, amortizationYears, downPaymentPercent, locationId,
    splitMode, budgetPercent1, budgetPercent2,
  } = useAffordStore(useShallow((s) => ({
    income1: s.income1, income2: s.income2,
    payFrequency1: s.payFrequency1, payFrequency2: s.payFrequency2,
    incomeType: s.incomeType, savings: s.savings,
    priceOverride: s.priceOverride, condoFeesMonthly: s.condoFeesMonthly,
    housingBudgetPercent: s.housingBudgetPercent,
    interestRate: s.interestRate, amortizationYears: s.amortizationYears,
    downPaymentPercent: s.downPaymentPercent, locationId: s.locationId,
    splitMode: s.splitMode, budgetPercent1: s.budgetPercent1, budgetPercent2: s.budgetPercent2,
  })))

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

  // Monthly budget — per-person mode uses individual percentages
  const monthlyBudget = splitMode === 'per-person'
    ? (monthlyIncome1 * (budgetPercent1 / 100)) + (monthlyIncome2 * (budgetPercent2 / 100))
    : totalMonthlyIncome * (housingBudgetPercent / 100)

  // Debounce continuous values (sliders), pass discrete values (button clicks) directly
  const dBudget = useDebounce(monthlyBudget, 150)
  const dRate = useDebounce(annualRate, 150)
  const dOverride = useDebounce(priceOverride, 150)
  const dCondoFees = useDebounce(condoFeesMonthly, 150)
  const dDown = downPaymentPercent
  const dYears = amortizationYears

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
    housingBudgetPercent,
    budgetPercent1,
    budgetPercent2,
    interestRate,
    amortizationYears,
    locationId,
    condoFeesMonthly,
  }
}
