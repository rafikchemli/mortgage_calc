// Welcome tax (droits de mutation) brackets — Standard Quebec (2026)
export const WELCOME_TAX_BRACKETS_QUEBEC = [
  { min: 0, max: 62900, rate: 0.005 },
  { min: 62900, max: 315000, rate: 0.01 },
  { min: 315000, max: 552300, rate: 0.015 },
  { min: 552300, max: Infinity, rate: 0.015 },
]

// Montreal has additional higher brackets (2026)
export const WELCOME_TAX_BRACKETS_MONTREAL = [
  { min: 0, max: 62900, rate: 0.005 },
  { min: 62900, max: 315000, rate: 0.01 },
  { min: 315000, max: 552300, rate: 0.015 },
  { min: 552300, max: 1104700, rate: 0.02 },
  { min: 1104700, max: 2136500, rate: 0.025 },
  { min: 2136500, max: 3113000, rate: 0.035 },
  { min: 3113000, max: Infinity, rate: 0.04 },
]

// Municipal tax rates per $100 assessed value (2025 official PDF)
// City-wide base: General 0.4638 + ARTM 0.0072 + Roads 0.0024 + Water 0.0813 = 0.5547
// Borough total = base + historic debt + borough services + borough capital
const MTL_BASE = 0.005547

export const MUNICIPAL_TAX_RATES = {
  'ahuntsic-cartierville':     MTL_BASE + 0.000221 + 0.000422 + 0.000306,
  'anjou':                     MTL_BASE + 0.000058 + 0.001200 + 0.000699,
  'cdn-ndg':                   MTL_BASE + 0.000221 + 0.000389 + 0.000216,
  'lachine':                   MTL_BASE + 0.000011 + 0.000437 + 0.000328,
  'lasalle':                   MTL_BASE + 0.000032 + 0.000562 + 0.000319,
  'le-plateau-mont-royal':     MTL_BASE + 0.000221 + 0.000486 + 0.000246,
  'le-sud-ouest':              MTL_BASE + 0.000221 + 0.000493 + 0.000249,
  'mercier-hochelaga':         MTL_BASE + 0.000221 + 0.000596 + 0.000384,
  'montreal-nord':             MTL_BASE + 0.000121 + 0.001274 + 0.000513,
  'outremont':                 MTL_BASE + 0.000055 + 0.000428 + 0.000305,
  'rdp-pat':                   MTL_BASE + 0.000221 + 0.000715 + 0.000662,
  'rosemont-la-petite-patrie': MTL_BASE + 0.000221 + 0.000461 + 0.000276,
  'saint-laurent':             MTL_BASE + 0.000035 + 0.000623 + 0.000339,
  'saint-leonard':             MTL_BASE + 0.000066 + 0.000777 + 0.000473,
  'verdun':                    MTL_BASE + 0.000042 + 0.000527 + 0.000333,
  'ville-marie':               MTL_BASE + 0.000221 + 0.000385 + 0.000075,
  'villeray-saint-michel':     MTL_BASE + 0.000221 + 0.000507 + 0.000301,
  // Non-Montreal cities
  'laval':                     0.00780,
  'quebec-city':               0.00800,
  'other-quebec':              0.01000,
}

// School tax rate — Quebec-wide (2025-2026: $0.08423 per $100)
export const SCHOOL_TAX_RATE = 0.0008423
export const SCHOOL_TAX_EXEMPTION = 25000

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
  // Montreal boroughs
  { id: 'ahuntsic-cartierville', label: 'Ahuntsic-Cartierville', group: 'Montreal' },
  { id: 'anjou', label: 'Anjou', group: 'Montreal' },
  { id: 'cdn-ndg', label: 'CDN-NDG', group: 'Montreal' },
  { id: 'lachine', label: 'Lachine', group: 'Montreal' },
  { id: 'lasalle', label: 'LaSalle', group: 'Montreal' },
  { id: 'le-plateau-mont-royal', label: 'Le Plateau-Mont-Royal', group: 'Montreal' },
  { id: 'le-sud-ouest', label: 'Le Sud-Ouest', group: 'Montreal' },
  { id: 'mercier-hochelaga', label: 'Mercier-Hochelaga-Maisonneuve', group: 'Montreal' },
  { id: 'montreal-nord', label: 'Montréal-Nord', group: 'Montreal' },
  { id: 'outremont', label: 'Outremont', group: 'Montreal' },
  { id: 'rdp-pat', label: 'RDP-PAT', group: 'Montreal' },
  { id: 'rosemont-la-petite-patrie', label: 'Rosemont-La Petite-Patrie', group: 'Montreal' },
  { id: 'saint-laurent', label: 'Saint-Laurent', group: 'Montreal' },
  { id: 'saint-leonard', label: 'Saint-Léonard', group: 'Montreal' },
  { id: 'verdun', label: 'Verdun', group: 'Montreal' },
  { id: 'ville-marie', label: 'Ville-Marie', group: 'Montreal' },
  { id: 'villeray-saint-michel', label: 'Villeray-Saint-Michel-Parc-Extension', group: 'Montreal' },
  // Other cities
  { id: 'laval', label: 'Laval', group: 'Other' },
  { id: 'quebec-city', label: 'Quebec City', group: 'Other' },
  { id: 'other-quebec', label: 'Other Quebec', group: 'Other' },
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
