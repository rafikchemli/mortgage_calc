/**
 * Quebec gross-to-net income estimation (2024 rates).
 * Includes federal tax, Quebec provincial tax, QPP, EI, and QPIP.
 * This is an approximation — actual net depends on deductions, credits, etc.
 */

// Federal brackets 2024
const FEDERAL_BRACKETS = [
  { min: 0,      max: 55867,  rate: 0.15 },
  { min: 55867,  max: 111733, rate: 0.205 },
  { min: 111733, max: 154906, rate: 0.26 },
  { min: 154906, max: 220000, rate: 0.29 },
  { min: 220000, max: Infinity, rate: 0.33 },
]

// Quebec provincial brackets 2024
const QUEBEC_BRACKETS = [
  { min: 0,      max: 51780,  rate: 0.14 },
  { min: 51780,  max: 103545, rate: 0.19 },
  { min: 103545, max: 126000, rate: 0.24 },
  { min: 126000, max: Infinity, rate: 0.2575 },
]

// Basic personal amounts (non-refundable credits)
const FEDERAL_BASIC_PERSONAL = 15705
const QUEBEC_BASIC_PERSONAL = 17183

// QPP (Quebec Pension Plan) 2024
const QPP_RATE = 0.064
const QPP_MAX_PENSIONABLE = 68500
const QPP_EXEMPTION = 3500

// EI (Employment Insurance) 2024 — Quebec rate is lower
const EI_RATE_QC = 0.01320
const EI_MAX_INSURABLE = 63200

// QPIP (Quebec Parental Insurance Plan) 2024
const QPIP_RATE = 0.00494
const QPIP_MAX_INSURABLE = 94000

// Federal abatement for Quebec residents (16.5% of federal tax)
const QC_ABATEMENT_RATE = 0.165

function calcBracketTax(income, brackets) {
  let tax = 0
  for (const bracket of brackets) {
    if (income <= bracket.min) break
    const taxable = Math.min(income, bracket.max) - bracket.min
    tax += taxable * bracket.rate
  }
  return tax
}

/**
 * Estimate annual net income from annual gross income for a Quebec resident.
 */
export function grossToNetAnnual(grossAnnual) {
  if (grossAnnual <= 0) return 0

  // Federal tax
  let federalTax = calcBracketTax(grossAnnual, FEDERAL_BRACKETS)
  federalTax -= FEDERAL_BASIC_PERSONAL * 0.15 // basic personal credit
  federalTax *= (1 - QC_ABATEMENT_RATE) // Quebec abatement
  federalTax = Math.max(0, federalTax)

  // Quebec tax
  let quebecTax = calcBracketTax(grossAnnual, QUEBEC_BRACKETS)
  quebecTax -= QUEBEC_BASIC_PERSONAL * 0.14 // basic personal credit
  quebecTax = Math.max(0, quebecTax)

  // QPP
  const qppPensionable = Math.min(grossAnnual, QPP_MAX_PENSIONABLE) - QPP_EXEMPTION
  const qpp = Math.max(0, qppPensionable * QPP_RATE)

  // EI (Quebec rate)
  const ei = Math.min(grossAnnual, EI_MAX_INSURABLE) * EI_RATE_QC

  // QPIP
  const qpip = Math.min(grossAnnual, QPIP_MAX_INSURABLE) * QPIP_RATE

  const totalDeductions = federalTax + quebecTax + qpp + ei + qpip
  return Math.max(0, grossAnnual - totalDeductions)
}

/**
 * Estimate annual gross income from annual net income (inverse via binary search).
 */
export function netToGrossAnnual(netAnnual) {
  if (netAnnual <= 0) return 0
  let lo = netAnnual
  let hi = netAnnual * 2.5
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2
    const net = grossToNetAnnual(mid)
    if (net < netAnnual) lo = mid
    else hi = mid
  }
  return Math.round((lo + hi) / 2)
}
