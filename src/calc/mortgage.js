/**
 * Canadian mortgages compound semi-annually (not monthly).
 * Effective monthly rate: r = (1 + annual/2)^(1/6) - 1
 */
function getMonthlyRate(annualRate) {
  if (annualRate === 0) return 0
  return Math.pow(1 + annualRate / 2, 1 / 6) - 1
}

/**
 * Monthly mortgage payment using standard amortization formula.
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calcMonthlyPayment(principal, annualRate, amortizationYears) {
  if (principal <= 0) return 0
  const r = getMonthlyRate(annualRate)
  const n = amortizationYears * 12

  if (r === 0) return principal / n

  const factor = Math.pow(1 + r, n)
  return principal * (r * factor) / (factor - 1)
}

/**
 * Generate amortization schedule — yearly aggregates for charting.
 * Returns array of { year, principalPaid, interestPaid, balance }
 */
export function generateAmortizationSchedule(principal, annualRate, amortizationYears) {
  const r = getMonthlyRate(annualRate)
  const n = amortizationYears * 12
  const monthlyPayment = calcMonthlyPayment(principal, annualRate, amortizationYears)

  if (monthlyPayment <= 0) return []

  let balance = principal
  const schedule = []

  for (let year = 1; year <= amortizationYears; year++) {
    let yearPrincipal = 0
    let yearInterest = 0

    for (let month = 0; month < 12; month++) {
      if (balance <= 0) break
      const interestPayment = balance * r
      const principalPayment = Math.min(monthlyPayment - interestPayment, balance)
      yearPrincipal += principalPayment
      yearInterest += interestPayment
      balance -= principalPayment
    }

    schedule.push({
      year,
      principalPaid: Math.round(yearPrincipal),
      interestPaid: Math.round(yearInterest),
      balance: Math.max(0, Math.round(balance)),
    })
  }

  return schedule
}
