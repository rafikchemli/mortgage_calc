// Welcome tax (droits de mutation) brackets — Standard Quebec
export const WELCOME_TAX_BRACKETS_QUEBEC = [
  { min: 0, max: 58900, rate: 0.005 },
  { min: 58900, max: 294600, rate: 0.01 },
  { min: 294600, max: 552300, rate: 0.015 },
  { min: 552300, max: Infinity, rate: 0.015 },
]

// Montreal has additional higher brackets
export const WELCOME_TAX_BRACKETS_MONTREAL = [
  { min: 0, max: 58900, rate: 0.005 },
  { min: 58900, max: 294600, rate: 0.01 },
  { min: 294600, max: 552300, rate: 0.015 },
  { min: 552300, max: 1104700, rate: 0.02 },
  { min: 1104700, max: 2136500, rate: 0.025 },
  { min: 2136500, max: 3113000, rate: 0.035 },
  { min: 3113000, max: Infinity, rate: 0.04 },
]

// Municipal tax rates (approximate annual % of assessed value)
export const MUNICIPAL_TAX_RATES = {
  'montreal-rosemont': 0.00861,
  'laval': 0.00780,
  'quebec-city': 0.00800,
  'other-quebec': 0.01000,
}

// School tax rate — Quebec-wide
export const SCHOOL_TAX_RATE = 0.001064

// CMHC mortgage insurance premiums (% of mortgage amount)
export const CMHC_PREMIUMS = {
  5: 0.0400,
  10: 0.0310,
  15: 0.0280,
  20: 0,
  25: 0,
}

// Additional surcharge for 30-year amortization
export const CMHC_30YR_SURCHARGE = 0.0020

// Quebec sales tax applied to CMHC premium (paid upfront, cannot be added to mortgage)
export const QST_RATE = 0.09975

// Maximum insurable home price
export const CMHC_MAX_PRICE = 1500000

export const LOCATIONS = [
  { id: 'montreal-rosemont', label: 'Montreal (Rosemont)' },
  { id: 'laval', label: 'Laval' },
  { id: 'quebec-city', label: 'Quebec City' },
  { id: 'other-quebec', label: 'Other Quebec' },
]

export const DOWN_PAYMENT_OPTIONS = [5, 10, 15, 20, 25]
export const AMORTIZATION_OPTIONS = [20, 25, 30]

export const DEFAULT_MAINTENANCE_RATE = 0.01
export const DEFAULT_HOME_INSURANCE_ANNUAL = 1200

// Typical Quebec closing costs (fixed estimates)
export const CLOSING_COSTS = {
  notary: 1800,
  homeInspection: 550,
}
