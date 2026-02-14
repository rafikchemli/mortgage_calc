import { useMemo } from 'react'
import useAffordStore from '../store/useAffordStore'
import { calcMaxAffordablePrice, calcStressTest, calcCostBreakdownForPrice } from '../calc/affordability'
import { calcCMHCInsurance } from '../calc/insurance'
import { calcWelcomeTax } from '../calc/taxes'
import { useDebounce } from './useDebounce'

function toMonthly(value, frequency) {
  switch (frequency) {
    case 'biweekly': return value * 26 / 12
    case 'monthly': return value
    case 'yearly': return value / 12
    default: return value * 26 / 12
  }
}

export function useComputedAfford() {
  const state = useAffordStore()

  const {
    income1, income2, payFrequency, housingPercent1, housingPercent2,
    downPaymentPercent, interestRate, amortizationYears,
  } = state

  const annualRate = interestRate / 100

  const monthlyIncome1 = toMonthly(income1, payFrequency)
  const monthlyIncome2 = toMonthly(income2, payFrequency)
  const totalMonthlyIncome = monthlyIncome1 + monthlyIncome2

  // Each person contributes their own chosen % of their income
  const contribution1 = monthlyIncome1 * (housingPercent1 / 100)
  const contribution2 = monthlyIncome2 * (housingPercent2 / 100)
  const monthlyBudget = contribution1 + contribution2

  // Effective combined housing %
  const effectiveHousingPercent = totalMonthlyIncome > 0
    ? (monthlyBudget / totalMonthlyIncome) * 100
    : 0

  // Debounce the heavy binary search computation
  const dBudget = useDebounce(monthlyBudget, 200)
  const dDown = useDebounce(downPaymentPercent, 200)
  const dRate = useDebounce(annualRate, 200)
  const dYears = useDebounce(amortizationYears, 200)

  const maxPrice = useMemo(
    () => calcMaxAffordablePrice(dBudget, dDown, dRate, dYears, 'montreal-rosemont'),
    [dBudget, dDown, dRate, dYears]
  )

  const stressTest = useMemo(
    () => calcStressTest(maxPrice, downPaymentPercent, annualRate, 0.02, amortizationYears, 'montreal-rosemont'),
    [maxPrice, downPaymentPercent, annualRate, amortizationYears]
  )

  const stressedMaxPrice = useMemo(
    () => calcMaxAffordablePrice(dBudget, dDown, dRate + 0.02, dYears, 'montreal-rosemont'),
    [dBudget, dDown, dRate, dYears]
  )

  const downPaymentAmount = maxPrice * (downPaymentPercent / 100)

  // Cost breakdown for the max affordable price
  const costBreakdown = useMemo(
    () => calcCostBreakdownForPrice(maxPrice, downPaymentPercent, annualRate, amortizationYears, 'montreal-rosemont'),
    [maxPrice, downPaymentPercent, annualRate, amortizationYears]
  )

  // Upfront costs for the max affordable price
  const cmhc = useMemo(
    () => calcCMHCInsurance(maxPrice, downPaymentPercent, amortizationYears),
    [maxPrice, downPaymentPercent, amortizationYears]
  )

  const welcomeTax = useMemo(
    () => calcWelcomeTax(maxPrice, 'montreal-rosemont'),
    [maxPrice]
  )

  return {
    monthlyIncome1,
    monthlyIncome2,
    totalMonthlyIncome,
    monthlyBudget,
    contribution1,
    contribution2,
    maxPrice,
    stressTest,
    stressedMaxPrice,
    downPaymentAmount,
    housingPercent1,
    housingPercent2,
    effectiveHousingPercent,
    costBreakdown,
    cmhc,
    welcomeTax,
    interestRate,
    downPaymentPercent,
  }
}
