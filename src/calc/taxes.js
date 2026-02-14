import {
  WELCOME_TAX_BRACKETS_MONTREAL,
  WELCOME_TAX_BRACKETS_QUEBEC,
  MUNICIPAL_TAX_RATES,
  SCHOOL_TAX_RATE,
} from '../data/constants'

/**
 * Calculate welcome tax (droits de mutation) using progressive brackets.
 * Montreal has additional higher brackets.
 */
export function calcWelcomeTax(housePrice, locationId) {
  const isMontreal = locationId === 'montreal-rosemont'
  const brackets = isMontreal ? WELCOME_TAX_BRACKETS_MONTREAL : WELCOME_TAX_BRACKETS_QUEBEC

  let total = 0
  const breakdown = []

  for (const bracket of brackets) {
    if (housePrice <= bracket.min) break

    const taxableInBracket = Math.min(housePrice, bracket.max) - bracket.min
    const taxAmount = taxableInBracket * bracket.rate

    if (taxAmount > 0) {
      breakdown.push({
        min: bracket.min,
        max: Math.min(housePrice, bracket.max),
        rate: bracket.rate,
        amount: Math.round(taxAmount),
      })
    }

    total += taxAmount
  }

  return { total: Math.round(total), breakdown }
}

/**
 * Calculate annual property tax (municipal + school).
 * Returns monthly breakdown.
 */
export function calcPropertyTax(assessedValue, locationId) {
  const municipalRate = MUNICIPAL_TAX_RATES[locationId] || MUNICIPAL_TAX_RATES['other-quebec']
  const municipal = assessedValue * municipalRate
  const school = assessedValue * SCHOOL_TAX_RATE
  const total = municipal + school

  return {
    municipal: Math.round(municipal),
    school: Math.round(school),
    totalAnnual: Math.round(total),
    monthly: Math.round(total / 12),
  }
}
