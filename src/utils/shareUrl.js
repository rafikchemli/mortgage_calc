import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

const FIELD_ORDER = [
  'income1', 'income2', 'payFrequency', 'incomeType',
  'housingPercent1', 'housingPercent2', 'downPaymentPercent',
  'interestRate', 'amortizationYears',
]

export function encodeState(store) {
  const arr = FIELD_ORDER.map((key) => store[key])
  return compressToEncodedURIComponent(JSON.stringify(arr))
}

export function decodeHash(hash) {
  try {
    const raw = decompressFromEncodedURIComponent(hash)
    if (!raw) return null
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr) || arr.length !== FIELD_ORDER.length) return null
    const result = {}
    FIELD_ORDER.forEach((key, i) => { result[key] = arr[i] })
    return result
  } catch {
    return null
  }
}

export function buildShareUrl(store) {
  const hash = encodeState(store)
  return `${window.location.origin}${window.location.pathname}#${hash}`
}
