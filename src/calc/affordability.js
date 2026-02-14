import { calcMonthlyPayment } from './mortgage'
import { calcCMHCInsurance } from './insurance'
import { calcPropertyTax } from './taxes'
import { calcMonthlyMaintenance, calcMonthlyInsurance, calcTotalMonthlyCost } from './costs'
import { DEFAULT_HOME_INSURANCE_ANNUAL, DEFAULT_MAINTENANCE_RATE } from '../data/constants'

/**
 * Calculate total monthly cost for a given house price.
 * Used by both Tab 1 (directly) and Tab 2 (inside binary search).
 */
function totalMonthlyCostForPrice(housePrice, downPaymentPercent, annualRate, amortizationYears, locationId) {
  return calcCostBreakdownForPrice(housePrice, downPaymentPercent, annualRate, amortizationYears, locationId).total
}

/**
 * Full cost breakdown for a given house price — returns items + total.
 */
export function calcCostBreakdownForPrice(housePrice, downPaymentPercent, annualRate, amortizationYears, locationId) {
  const downPayment = housePrice * (downPaymentPercent / 100)
  const baseMortgage = housePrice - downPayment

  const cmhc = calcCMHCInsurance(housePrice, downPaymentPercent, amortizationYears)
  const principal = cmhc.isRequired && !cmhc.exceedsMax ? cmhc.totalMortgage : baseMortgage

  const mortgagePayment = calcMonthlyPayment(principal, annualRate, amortizationYears)
  const propertyTax = calcPropertyTax(housePrice, locationId)
  const maintenanceMonthly = calcMonthlyMaintenance(housePrice, DEFAULT_MAINTENANCE_RATE)
  const homeInsuranceMonthly = calcMonthlyInsurance(DEFAULT_HOME_INSURANCE_ANNUAL)

  return calcTotalMonthlyCost({
    mortgagePayment,
    propertyTaxMonthly: propertyTax.monthly,
    maintenanceMonthly,
    homeInsuranceMonthly,
    utilities: 250,
  })
}

/**
 * Reverse-solve: Given a monthly budget, find the max affordable house price.
 * Uses binary search because CMHC thresholds create discontinuities.
 */
export function calcMaxAffordablePrice(monthlyBudget, downPaymentPercent, annualRate, amortizationYears, locationId) {
  let low = 100000
  let high = 5000000
  let result = low

  for (let i = 0; i < 50; i++) {
    const mid = Math.round((low + high) / 2)
    const cost = totalMonthlyCostForPrice(mid, downPaymentPercent, annualRate, amortizationYears, locationId)

    if (cost <= monthlyBudget) {
      result = mid
      low = mid + 100
    } else {
      high = mid - 100
    }

    if (high - low < 100) break
  }

  return result
}

/**
 * Stress test: what happens if rates go up by a given amount?
 */
export function calcStressTest(housePrice, downPaymentPercent, currentRate, rateIncrease, amortizationYears, locationId) {
  const currentCost = totalMonthlyCostForPrice(housePrice, downPaymentPercent, currentRate, amortizationYears, locationId)
  const stressedCost = totalMonthlyCostForPrice(housePrice, downPaymentPercent, currentRate + rateIncrease, amortizationYears, locationId)

  return {
    currentMonthly: currentCost,
    stressedMonthly: stressedCost,
    increase: stressedCost - currentCost,
  }
}

/**
 * Split payment between partners proportional to income.
 */
export function calcPartnerSplit(totalMonthly, income1, income2) {
  if (income2 <= 0) {
    return { person1: totalMonthly, person2: 0, ratio: [100, 0] }
  }

  const totalIncome = income1 + income2
  const ratio1 = income1 / totalIncome
  const ratio2 = income2 / totalIncome

  return {
    person1: Math.round(totalMonthly * ratio1),
    person2: Math.round(totalMonthly * ratio2),
    ratio: [Math.round(ratio1 * 100), Math.round(ratio2 * 100)],
  }
}
