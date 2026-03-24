import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

const FIELD_ORDER = [
  'income1', 'income2', 'payFrequency1', 'payFrequency2', 'incomeType', 'savings',
  'priceOverride', 'condoFeesMonthly',
  'splitMode', 'customSplit', 'budgetPercent1', 'budgetPercent2',
  'housingBudgetPercent', 'interestRate', 'amortizationYears', 'downPaymentPercent', 'locationId',
]

export function encodeState(store) {
  const arr = FIELD_ORDER.map((key) => store[key])
  return compressToEncodedURIComponent(JSON.stringify(arr))
}

export function decodeShareParams() {
  const params = new URLSearchParams(window.location.search)
  const s = params.get('s')
  if (!s) return null
  try {
    const raw = decompressFromEncodedURIComponent(s)
    if (!raw) return null
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return null

    // v3 format (11 fields)
    if (arr.length === FIELD_ORDER.length) {
      const result = {}
      FIELD_ORDER.forEach((key, i) => { result[key] = arr[i] })
      return result
    }

    // v1/v2 backward compat — map old fields to current schema
    if (arr.length >= 9) {
      const freq = arr[2] || 'biweekly'
      return {
        income1: arr[0],
        income2: arr[1],
        payFrequency1: freq,
        payFrequency2: freq,
        incomeType: arr[3] || 'net',
        savings: 100000,
        priceOverride: 0,
        condoFeesMonthly: 0,
        splitMode: 'proportional',
        customSplit: 50,
        budgetPercent1: 35,
        budgetPercent2: 35,
        housingBudgetPercent: 35,
        interestRate: arr[7] || 5.0,
        amortizationYears: arr[8] || 25,
        downPaymentPercent: arr[6] || 20,
        locationId: arr[9] || 'rosemont-la-petite-patrie',
      }
    }

    return null
  } catch {
    return null
  }
}

export function buildShareUrl(store) {
  const s = encodeState(store)
  const base = `${window.location.origin}${window.location.pathname}`
  return `${base}?s=${s}`
}
