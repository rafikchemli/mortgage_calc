/**
 * Monthly maintenance estimate (% of home value per year, divided by 12).
 */
export function calcMonthlyMaintenance(housePrice, maintenanceRate) {
  return (housePrice * maintenanceRate) / 12
}

/**
 * Monthly home insurance.
 */
export function calcMonthlyInsurance(annualInsurance) {
  return annualInsurance / 12
}

/**
 * Aggregate all monthly housing costs into a single breakdown.
 */
export function calcTotalMonthlyCost({
  mortgagePayment,
  propertyTaxMonthly,
  maintenanceMonthly,
  homeInsuranceMonthly,
  utilities,
}) {
  const items = [
    { name: 'Mortgage (P+I)', value: Math.round(mortgagePayment) },
    { name: 'Property Tax', value: Math.round(propertyTaxMonthly) },
    { name: 'Maintenance', value: Math.round(maintenanceMonthly) },
    { name: 'Home Insurance', value: Math.round(homeInsuranceMonthly) },
    { name: 'Utilities', value: Math.round(utilities) },
  ]

  const total = items.reduce((sum, item) => sum + item.value, 0)

  return { items, total }
}
