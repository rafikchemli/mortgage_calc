import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

const FIELD_ORDER = [
  'income1', 'income2', 'payFrequency', 'incomeType',
  'housingPercent1', 'housingPercent2', 'downPaymentPercent',
  'interestRate', 'amortizationYears', 'locationId',
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
    if (!Array.isArray(arr) || arr.length < FIELD_ORDER.length - 1) return null
    // Backward compat: old URLs have 9 fields (no locationId)
    if (arr.length === FIELD_ORDER.length - 1) arr.push('rosemont-la-petite-patrie')
    const result = {}
    FIELD_ORDER.forEach((key, i) => { result[key] = arr[i] })
    return result
  } catch {
    return null
  }
}

export function buildShareUrl(store, maxPrice) {
  const s = encodeState(store)
  const base = `${window.location.origin}${window.location.pathname}`
  const price = Math.round(maxPrice)
  return `${base}?s=${s}&p=${price}`
}
