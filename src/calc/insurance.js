import { CMHC_PREMIUMS, CMHC_30YR_SURCHARGE, QST_RATE, CMHC_MAX_PRICE } from '../data/constants'

/**
 * Calculate CMHC mortgage insurance.
 * Insurance is required when down payment < 20%.
 * Premium is a % of the mortgage amount, added to the principal.
 * QST (9.975%) on the premium must be paid upfront.
 */
export function calcCMHCInsurance(housePrice, downPaymentPercent, amortizationYears) {
  const isRequired = downPaymentPercent < 20
  const exceedsMax = housePrice > CMHC_MAX_PRICE

  if (!isRequired) {
    return { premium: 0, qst: 0, monthlyPremium: 0, isRequired: false, exceedsMax: false }
  }

  if (exceedsMax) {
    return { premium: 0, qst: 0, monthlyPremium: 0, isRequired: true, exceedsMax: true }
  }

  const downPayment = housePrice * (downPaymentPercent / 100)
  const mortgageAmount = housePrice - downPayment

  // Find the closest premium rate (round down to nearest 5%)
  const key = Math.floor(downPaymentPercent / 5) * 5
  let premiumRate = CMHC_PREMIUMS[key] || CMHC_PREMIUMS[5]

  // 30-year amortization surcharge
  if (amortizationYears >= 30) {
    premiumRate += CMHC_30YR_SURCHARGE
  }

  const premium = mortgageAmount * premiumRate
  const qst = premium * QST_RATE

  return {
    premium: Math.round(premium),
    qst: Math.round(qst),
    monthlyPremium: 0, // premium is added to principal, not paid monthly
    isRequired: true,
    exceedsMax: false,
    totalMortgage: mortgageAmount + premium,
  }
}
